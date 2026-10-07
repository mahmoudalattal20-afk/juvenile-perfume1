import https from "https";

function getKeyPool(): string[] {
  const envKeys = process.env.GEMINI_API_KEYS;
  if (!envKeys) {
    return [];
  }
  const rawList = envKeys.split(",").map((k) => k.trim()).filter(Boolean);
  // Prioritize valid AIza Google AI Studio keys first
  const valid = rawList.filter((k) => k.startsWith("AIza"));
  const others = rawList.filter((k) => !k.startsWith("AIza"));
  return [...valid, ...others];
}

// Current active index in round-robin / rotation
let currentKeyIndex = 0;

// Reusable HTTPS agent with strict TLS certificate verification (Security Standard 2026)
const httpsAgent = new https.Agent({
  rejectUnauthorized: process.env.ALLOW_INSECURE_TLS === "true" ? false : true,
  keepAlive: true,
  timeout: 5000,
});

const CANDIDATE_MODELS = [
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-2.5-flash",
];

export interface HistoryMessage {
  role: "user" | "assistant" | "model";
  content: string;
}

export interface GeminiResponse {
  reply: string;
  recommendedProductIds: string[];
  suggestedPrompts: string[];
  rawJson?: any;
}

/**
 * Execute a prompt with automatic key and model failover
 */
export async function generateWithGemini(
  systemInstruction: string,
  userMessage: string,
  history?: HistoryMessage[]
): Promise<GeminiResponse | null> {
  const keys = getKeyPool();
  const totalKeys = keys.length;
  const startTime = Date.now();
  const MAX_TOTAL_BUDGET_MS = 3800; // Fast budget for remote AI

  for (let attempt = 0; attempt < Math.min(totalKeys, 3); attempt++) {
    if (Date.now() - startTime > MAX_TOTAL_BUDGET_MS) {
      break;
    }

    const keyIndex = (currentKeyIndex + attempt) % totalKeys;
    const key = keys[keyIndex];

    for (const model of CANDIDATE_MODELS) {
      if (Date.now() - startTime > MAX_TOTAL_BUDGET_MS) {
        break;
      }

      try {
        const result = await callGeminiApi(key, model, systemInstruction, userMessage, history);
        if (result && (result.reply || result.recommendedProductIds.length > 0 || result.rawJson)) {
          currentKeyIndex = keyIndex;
          return result;
        }
      } catch (err: any) {
        const errMsg = err?.message || "";
        // If 429 quota or 403, immediately skip this key to avoid wasting time
        if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("403")) {
          break;
        }
      }
    }
  }

  return null;
}

/**
 * Call Gemini API with JSON mode
 */
function callGeminiApi(
  apiKey: string,
  model: string,
  systemInstruction: string,
  userMessage: string,
  history?: HistoryMessage[]
): Promise<GeminiResponse | null> {
  return new Promise((resolve, reject) => {
    const contents: Array<{ role: "user" | "model"; parts: [{ text: string }] }> = [];

    if (history && history.length > 0) {
      // 2026 Defense: Bound history window to last 6 messages & truncate length to prevent token explosion
      const boundedHistory = history.slice(-6);
      for (const h of boundedHistory) {
        const text = (h.content || "").trim().slice(0, 350);
        if (!text) continue;
        const gRole = h.role === "assistant" || h.role === "model" ? "model" : "user";
        if (contents.length === 0 && gRole === "model") {
          continue;
        }
        if (contents.length > 0 && contents[contents.length - 1].role === gRole) {
          contents[contents.length - 1].parts[0].text += `\n${text}`;
        } else {
          contents.push({ role: gRole, parts: [{ text }] });
        }
      }
    }

    if (contents.length > 0 && contents[contents.length - 1].role === "user") {
      if (contents[contents.length - 1].parts[0].text !== userMessage) {
        contents[contents.length - 1].parts[0].text = userMessage;
      }
    } else {
      contents.push({ role: "user", parts: [{ text: userMessage }] });
    }

    const payload = JSON.stringify({
      contents,
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    });

    const options: https.RequestOptions = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
      method: "POST",
      agent: httpsAgent,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
      timeout: 3500,
    };

    const req = https.request(options, (res) => {
      let responseBody = "";

      res.on("data", (chunk) => {
        responseBody += chunk;
      });

      res.on("end", () => {
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(responseBody);
            const textContent =
              parsed.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textContent) {
              resolve(null);
              return;
            }

            let jsonOutput: any;
            try {
              jsonOutput = JSON.parse(textContent);
            } catch (pErr) {
              // Resilient fallback for unescaped newlines inside strings
              const sanitized = textContent
                .replace(/\r\n/g, "\\n")
                .replace(/\n/g, "\\n");
              try {
                jsonOutput = JSON.parse(sanitized);
              } catch (pErr2) {
                const match = textContent.match(/"(reply|aiInsight|recommendation)"\s*:\s*"([\s\S]*?)"\s*[,}]/);
                if (match) {
                  jsonOutput = {
                    reply: match[2],
                    recommendedProductIds: [],
                    suggestedPrompts: [],
                  };
                } else {
                  throw pErr;
                }
              }
            }

            // Extract reply/insight from various common field names
            const rawReply =
              jsonOutput.reply ||
              jsonOutput.aiInsight ||
              jsonOutput.recommendation ||
              jsonOutput.answer ||
              jsonOutput.message ||
              "";

            // Clean any accidental asterisks (* or ** or ***) and markdown headings
            const cleanReply = String(rawReply)
              .replace(/\*{1,4}/g, "") // Remove all asterisks
              .replace(/#{1,6}\s?/g, "") // Remove markdown headings
              .trim();

            const productIds = Array.isArray(jsonOutput.recommendedProductIds)
              ? jsonOutput.recommendedProductIds
              : Array.isArray(jsonOutput.matchedIds)
              ? jsonOutput.matchedIds
              : Array.isArray(jsonOutput.products)
              ? jsonOutput.products
              : [];

            resolve({
              reply: cleanReply,
              recommendedProductIds: productIds,
              suggestedPrompts: Array.isArray(jsonOutput.suggestedPrompts)
                ? jsonOutput.suggestedPrompts
                : [],
              rawJson: jsonOutput,
            });
          } catch (jsonErr) {
            console.warn("[Gemini Client] JSON parse error from model response:", jsonErr);
            resolve(null);
          }
        } else {
          // Status code was not 200 (e.g. 429 rate limit, 403 quota)
          reject(
            new Error(
              `HTTP ${res.statusCode}: ${responseBody.slice(0, 150)}`
            )
          );
        }
      });
    });

    req.on("timeout", () => {
      req.destroy(new Error("Gemini API request timed out (3.5s)"));
    });

    req.on("error", (e) => {
      reject(e);
    });

    req.write(payload);
    req.end();
  });
}
