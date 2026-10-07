import { NextResponse, type NextRequest } from "next/server";

// Known vulnerability scanners & automated attack tools signatures
const BLOCKED_SCANNER_PATTERNS = [
  /sqlmap/i,
  /nikto/i,
  /acunetix/i,
  /dirbuster/i,
  /gobuster/i,
  /wpscan/i,
  /masscan/i,
  /nmap/i,
  /zgrab/i,
  /morfeus/i,
  /havij/i,
];

// Secret key derivation for Edge HMAC verification
const SECRET_SEED = process.env.SESSION_SECRET || "fallback_default_juvenile_secret_2026_super_hardened";
const SECRET_GATEWAY_SLUG = process.env.ADMIN_SECRET_GATEWAY_SLUG || "atelier-gate";
const GATEWAY_TOKEN = process.env.ADMIN_GATEWAY_TOKEN || "juvenile_gate_pass_2026_luxury";

async function verifyEdgeToken(token: string | undefined | null): Promise<boolean> {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [headerB64, payloadB64, sigB64] = parts;

  try {
    const enc = new TextEncoder();
    // 1. Hash secret with SHA-256
    const keyData = await crypto.subtle.digest("SHA-256", enc.encode(SECRET_SEED));

    // 2. Import as HMAC key
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // 3. Convert Base64URL signature back to ArrayBuffer
    const sigBinary = atob(sigB64.replace(/-/g, "+").replace(/_/g, "/"));
    const sigBytes = new Uint8Array(sigBinary.length);
    for (let i = 0; i < sigBinary.length; i++) {
      sigBytes[i] = sigBinary.charCodeAt(i);
    }

    const dataToVerify = enc.encode(`${headerB64}.${payloadB64}`);
    const isValid = await crypto.subtle.verify("HMAC", cryptoKey, sigBytes, dataToVerify);
    if (!isValid) return false;

    // Check payload expiration & role
    const payloadJson = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));
    const now = Math.floor(Date.now() / 1000);

    if (!payloadJson.exp || payloadJson.exp < now) return false;
    if (payloadJson.role !== "admin") return false;

    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  try {
    const userAgent = req.headers.get("user-agent") || "";
    const pathname = req.nextUrl.pathname;

    // 1. Anti-Reconnaissance & Scanner Block
    if (BLOCKED_SCANNER_PATTERNS.some((pattern) => pattern.test(userAgent))) {
      return new NextResponse("Access Denied: Automated security testing tools are prohibited.", {
        status: 403,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // 2. Secret Gateway Entrance (Authorized Admin Entry Point)
    // When the real admin visits /atelier-gate, grant a secure clearance pass and forward to /admin
    if (pathname === `/${SECRET_GATEWAY_SLUG}` || pathname === `/${SECRET_GATEWAY_SLUG}/`) {
      const targetUrl = req.nextUrl.clone();
      targetUrl.pathname = "/admin";
      const forwardRes = NextResponse.redirect(targetUrl);
      forwardRes.cookies.set("juvenile_gate_clearance", GATEWAY_TOKEN, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600, // 1 hour clearance window
      });
      return forwardRes;
    }

    // Check admin session and gate clearance
    const sessionCookie =
      req.cookies.get("juvenile_secure_session")?.value ||
      req.cookies.get("juvenile_admin_session")?.value;
    const isVerifiedAdmin = await verifyEdgeToken(sessionCookie);
    const gateCookie = req.cookies.get("juvenile_gate_clearance")?.value;
    const hasGatePass = gateCookie === GATEWAY_TOKEN;

    // 3. Stealth Cloaking for /admin (Returns Fake 404 for any uninvited visitor)
    if (pathname === "/admin" || pathname === "/admin/") {
      if (!isVerifiedAdmin && !hasGatePass) {
        // Return 404 Not Found: Completely hides the dashboard existence from unauthorized visitors
        const notFoundUrl = req.nextUrl.clone();
        notFoundUrl.pathname = "/_not-found";
        return NextResponse.rewrite(notFoundUrl, { status: 404 });
      }
    }

    // 4. Cloaking & Protection for Admin API routes
    if (pathname.startsWith("/api/admin/")) {
      // If it's the auth endpoint, require at least the gate pass or an existing session
      if (pathname.startsWith("/api/admin/auth")) {
        if (!isVerifiedAdmin && !hasGatePass) {
          return NextResponse.json({ success: false, error: "Not Found" }, { status: 404 });
        }
      } else if (!pathname.startsWith("/api/admin/logout")) {
        // Allow public GET for store content so the storefront and CMS provider can load latest products
        if (pathname === "/api/admin/content" && req.method === "GET") {
          // Content read-only is allowed; POST/writes are strictly protected by isAdmin(req) inside route
        } else if (!isVerifiedAdmin) {
          // For all other admin data endpoints and write mutations, require full verified admin session
          return NextResponse.json(
            {
              success: false,
              error: "تم رفض الطلب: الوصول غير مصرح به (Unauthorized Access Blocked)",
            },
            { status: 401 }
          );
        }
      }
    }

    const response = NextResponse.next();

    // 5. Defense-in-Depth Security Headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

    return response;
  } catch (err) {
    console.error("Middleware Edge Exception:", err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets, _next, and uploaded media
     */
    "/((?!_next/static|_next/image|favicon.ico|uploads/).*)",
  ],
};
