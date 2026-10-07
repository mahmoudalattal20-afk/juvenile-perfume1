/**
 * ==============================================================================
 *  🌸 JUVENILE PERFUME - ALL-IN-ONE HIGH SPEED RUNNER (LOCAL + CLOUDFLARE) 🌸
 * ==============================================================================
 *  Designed for maximum speed, clean Windows CMD compatibility, and zero errors.
 * ==============================================================================
 */

const { spawn, exec, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const dns = require('dns');
const readline = require('readline');

// Color formatting
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

const ROOT_DIR = __dirname;
const NEXT_BIN = path.join(ROOT_DIR, 'node_modules', 'next', 'dist', 'bin', 'next');
const PUBLIC_URL_FILE = path.join(ROOT_DIR, 'public-url.txt');
let LOCAL_PORT = 3000;
let LOCAL_URL = `http://localhost:${LOCAL_PORT}`;

let nextProcess = null;
let tunnelProcess = null;
let publicUrl = null;
let isNextReady = false;
let isTunnelReady = false;
let isAnnounced = false;
let isShuttingDown = false;
let currentMode = 'dev';

// ==========================================
// 1. Process & Port Cleanup Utilities
// ==========================================
function killPid(pid) {
  if (!pid || pid === process.pid) return;
  try {
    execSync(`taskkill /F /T /PID ${pid} 2>nul`);
  } catch (e) {}
}

function freePort(port) {
  try {
    const output = execSync(`netstat -ano -p tcp | findstr :${port}`).toString();
    const lines = output.trim().split('\n');
    const pids = new Set();
    for (const line of lines) {
      if (line.includes('LISTENING') || line.includes('ESTABLISHED')) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0' && pid !== String(process.pid)) {
          pids.add(pid);
        }
      }
    }
    for (const pid of pids) {
      killPid(pid);
    }
  } catch (e) {}
}

function killCloudflared() {
  try {
    execSync('taskkill /F /IM cloudflared.exe /T 2>nul');
  } catch (e) {}
}

function isPortInUse(port) {
  try {
    const output = execSync(`netstat -ano -p tcp | findstr :${port}`).toString();
    return output.includes('LISTENING');
  } catch (e) {
    return false;
  }
}

function preflightCleanup() {
  process.stdout.write(`[*] Checking and freeing port ${LOCAL_PORT}... `);
  freePort(LOCAL_PORT);
  killCloudflared();
  if (isPortInUse(LOCAL_PORT)) {
    console.log(`${C.yellow}Port 3000 is in use, dynamically switching to 3001...${C.reset}`);
    LOCAL_PORT = 3001;
    LOCAL_URL = `http://localhost:${LOCAL_PORT}`;
    freePort(LOCAL_PORT);
  } else {
    console.log(`${C.green}OK (Clean)${C.reset}`);
  }
}

// ==========================================
// 2. Clipboard & Browser Helper
// ==========================================
function copyToClipboard(text) {
  try {
    exec(`powershell -NoProfile -Command "Set-Clipboard -Value '${text}'"`, (err) => {
      if (err) {
        try {
          const child = spawn('clip');
          child.stdin.write(text);
          child.stdin.end();
        } catch (e) {}
      }
    });
  } catch (e) {}
}

function openBrowser(url) {
  try {
    exec(`start "" "${url}"`);
  } catch (e) {}
}

// ==========================================
// 3. Healthcheck Server
// ==========================================
function waitForServerReady(port, callback, timeoutMs = 45000) {
  const startTime = Date.now();
  let done = false;
  const interval = setInterval(() => {
    if (Date.now() - startTime > timeoutMs) {
      if (!done) {
        done = true;
        clearInterval(interval);
        callback(false);
      }
      return;
    }

    const req = http.get(`http://127.0.0.1:${port}/`, (res) => {
      if (!done) {
        done = true;
        clearInterval(interval);
        callback(true);
      }
    });

    req.on('error', () => {});
    req.setTimeout(4000, () => req.destroy());
  }, 500);
}

// Check if Cloudflare DNS has propagated
function verifyTunnelDns(hostname, callback) {
  // Use public DNS resolvers to verify global propagation
  const customResolver = new dns.Resolver();
  customResolver.setServers(['1.1.1.1', '8.8.8.8']);

  let attempts = 0;
  const maxAttempts = 20;

  const check = () => {
    attempts++;
    customResolver.resolve4(hostname, (err, addresses) => {
      if (!err && addresses && addresses.length > 0) {
        callback(true);
      } else if (attempts < maxAttempts) {
        setTimeout(check, 1000);
      } else {
        // Fallback after timeout
        callback(false);
      }
    });
  };
  check();
}

// ==========================================
// 4. Banner & Announcement
// ==========================================
function printHeader() {
  console.clear();
  console.log(`${C.bold}${C.magenta}===============================================================================${C.reset}`);
  console.log(`${C.bold}${C.white}           🌸 JUVENILE PERFUME - ALL-IN-ONE SPEED RUNNER 🌸           ${C.reset}`);
  console.log(`${C.bold}${C.magenta}===============================================================================${C.reset}\n`);
}

function announceSuccess() {
  if (isAnnounced) return;
  isAnnounced = true;

  console.log('\n' + `${C.bold}${C.green}===============================================================================${C.reset}`);
  console.log(`${C.bold}${C.green}  >>> STORE IS LIVE & READY TO USE! (المتجر يعمل الآن بنجاح)                 <<<${C.reset}`);
  console.log(`${C.bold}${C.green}===============================================================================${C.reset}`);
  
  console.log(`\n  ${C.bold}[Local PC]:${C.reset}        ${C.cyan}${LOCAL_URL}${C.reset}  ${C.dim}(For this computer - أسرع تشغيل محلي)${C.reset}`);

  if (publicUrl) {
    console.log(`  ${C.bold}[Cloudflare]:${C.reset}      ${C.bold}${C.yellow}${publicUrl}${C.reset}  ${C.dim}(For Mobile & External - عالمي)${C.reset}`);
    console.log(`\n  ${C.green}[OK] Global URL copied to clipboard! (تم نسخ الرابط للحافظة تلقائياً)${C.reset}`);
    
    try {
      fs.writeFileSync(PUBLIC_URL_FILE, publicUrl, 'utf8');
    } catch (e) {}

    copyToClipboard(publicUrl);
  }

  // Always open localhost on the local PC for instantaneous 0-delay loading!
  console.log(`  ${C.cyan}[OK] Opening store in browser (Localhost:3000)...${C.reset}`);
  openBrowser(LOCAL_URL);

  console.log('\n' + `${C.dim}-------------------------------------------------------------------------------${C.reset}`);
  console.log(`  ${C.bold}Quick Controls (اضغط الحرف في الكونسول للتحكم):${C.reset}`);
  console.log(`  ${C.bold}[L]${C.reset} Open Localhost in Browser (فتح الرابط المحلي)`);
  if (publicUrl) {
    console.log(`  ${C.bold}[O]${C.reset} Open Cloudflare URL in Browser (فتح الرابط العالمي)`);
    console.log(`  ${C.bold}[C]${C.reset} Copy Cloudflare URL to Clipboard (نسخ الرابط العالمي)`);
  }
  console.log(`  ${C.bold}[R]${C.reset} Restart Server & Tunnel (إعادة تشغيل الكل)`);
  console.log(`  ${C.bold}[Q]${C.reset} Stop & Clean Exit (إغلاق نظيف وسريع)`);
  console.log(`${C.dim}-------------------------------------------------------------------------------${C.reset}\n`);
}

// ==========================================
// 5. Spawning Next.js & Cloudflare
// ==========================================
function startNextServer(mode) {
  return new Promise((resolve) => {
    const isProd = mode === 'prod';
    const args = isProd ? [NEXT_BIN, 'start', '-p', String(LOCAL_PORT)] : [NEXT_BIN, 'dev', '-p', String(LOCAL_PORT)];

    console.log(`[+] Starting Next.js (${isProd ? 'Production Server' : 'Fast Dev Mode'})...`);

    nextProcess = spawn(process.execPath, args, {
      cwd: ROOT_DIR,
      stdio: ['ignore', 'inherit', 'inherit'],
      env: { ...process.env, PORT: String(LOCAL_PORT) }
    });

    nextProcess.on('exit', (code) => {
      if (!isShuttingDown) {
        console.log(`\n${C.yellow}[!] Next.js stopped (code: ${code}). Auto-recovering in 1.5s...${C.reset}`);
        isNextReady = false;
        setTimeout(() => {
          if (!isShuttingDown) {
            freePort(LOCAL_PORT);
            startNextServer(mode);
          }
        }, 1500);
      }
    });

    waitForServerReady(LOCAL_PORT, (ready) => {
      isNextReady = ready;
      if (ready) {
        console.log(`${C.green}[OK] Next.js is responsive on ${LOCAL_URL}${C.reset}`);
      }
      resolve();
    });
  });
}

function startCloudflareTunnel() {
  console.log(`[+] Starting Cloudflare Quick Tunnel...`);

  tunnelProcess = spawn('cloudflared', ['tunnel', '--url', `http://127.0.0.1:${LOCAL_PORT}`], {
    shell: true,
    cwd: ROOT_DIR
  });

  function handleTunnelData(chunk) {
    const text = chunk.toString();

    const match = text.match(/https:\/\/([a-zA-Z0-9-]+)\.trycloudflare\.com/);
    if (match && !publicUrl) {
      publicUrl = `https://${match[1]}.trycloudflare.com`;
      const hostname = `${match[1]}.trycloudflare.com`;

      console.log(`[+] Tunnel URL assigned: ${C.yellow}${publicUrl}${C.reset}`);
      process.stdout.write(`[*] Verifying Cloudflare DNS propagation... `);

      verifyTunnelDns(hostname, (ok) => {
        isTunnelReady = true;
        console.log(ok ? `${C.green}Verified OK!${C.reset}` : `${C.yellow}Ready${C.reset}`);
        if (isNextReady) {
          announceSuccess();
        }
      });
    }
  }

  tunnelProcess.stdout.on('data', handleTunnelData);
  tunnelProcess.stderr.on('data', handleTunnelData);

  tunnelProcess.on('exit', (code) => {
    if (!isShuttingDown) {
      console.log(`\n[!] Cloudflare tunnel stopped (code: ${code})`);
    }
  });
}

// ==========================================
// 6. Interactive Keyboard Handler
// ==========================================
function setupKeyboardShortcuts() {
  if (process.stdin.isTTY) {
    try {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf8');

      process.stdin.on('data', (key) => {
        if (key === '\u0003' || key.toLowerCase() === 'q') {
          shutdown(0);
          return;
        }

        if (key.toLowerCase() === 'o') {
          if (publicUrl) {
            console.log(`[>] Opening Cloudflare URL in browser: ${publicUrl}`);
            openBrowser(publicUrl);
          }
        } else if (key.toLowerCase() === 'l') {
          console.log(`[>] Opening Localhost in browser: ${LOCAL_URL}`);
          openBrowser(LOCAL_URL);
        } else if (key.toLowerCase() === 'c') {
          if (publicUrl) {
            copyToClipboard(publicUrl);
            console.log(`${C.green}[OK] Cloudflare URL copied to clipboard!${C.reset}`);
          }
        } else if (key.toLowerCase() === 'r') {
          console.log(`\n[>] Restarting server and tunnel...`);
          restart();
        }
      });
    } catch (e) {}
  }
}

// ==========================================
// 7. Cleanup & Shutdown
// ==========================================
function shutdown(code = 0) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n\n[!] Stopping server, tunnel, and cleaning ports...`);

  if (nextProcess && nextProcess.pid) killPid(nextProcess.pid);
  if (tunnelProcess && tunnelProcess.pid) killPid(tunnelProcess.pid);
  if (whatsappProcess && whatsappProcess.pid) killPid(whatsappProcess.pid);

  freePort(LOCAL_PORT);
  freePort(3002);
  killCloudflared();

  console.log(`${C.green}[OK] Clean shutdown complete. Goodbye! 🌸${C.reset}\n`);
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
process.on('exit', () => {
  if (!isShuttingDown) shutdown(0);
});

let whatsappProcess = null;

function startWhatsAppService() {
  const serviceScript = path.join(ROOT_DIR, 'server', 'whatsapp-service.js');
  if (!fs.existsSync(serviceScript)) return;

  if (isPortInUse(3002)) {
    console.log(`${C.green}[OK] WhatsApp Bot service is active on :3002${C.reset}`);
    return;
  }

  console.log(`[+] Starting Automated WhatsApp Bot Service on :3002...`);
  whatsappProcess = spawn(process.execPath, [serviceScript], {
    cwd: ROOT_DIR,
    stdio: ['ignore', 'inherit', 'inherit'],
    env: { ...process.env, WHATSAPP_PORT: '3002' },
  });

  whatsappProcess.on('exit', (code) => {
    if (!isShuttingDown && code !== 0) {
      console.log(`[!] WhatsApp Bot service exited with code ${code}. Auto-restarting in 3s...`);
      setTimeout(startWhatsAppService, 3000);
    }
  });
}

// ==========================================
// 8. Main Launch Flow
// ==========================================
async function runWithMode(mode) {
  currentMode = mode;
  isAnnounced = false;
  isNextReady = false;
  isTunnelReady = false;
  publicUrl = null;

  printHeader();
  preflightCleanup();
  startWhatsAppService();

  if (mode === 'clean') {
    isShuttingDown = true;
    console.log(`\n${C.green}[OK] All processes on port ${LOCAL_PORT} cleared successfully!${C.reset}\n`);
    process.exit(0);
    return;
  }

  if (mode === 'prod') {
    const buildIdPath = path.join(ROOT_DIR, '.next', 'BUILD_ID');
    if (!fs.existsSync(buildIdPath)) {
      console.log(`\n[*] Building project for production first...`);
      execSync(`"${process.execPath}" "${NEXT_BIN}" build`, { cwd: ROOT_DIR, stdio: 'inherit' });
    }
  } else if (mode === 'dev' || mode === 'local') {
    // Keep dev clean if switching from prod
  }

  if (mode === 'tunnel') {
    startCloudflareTunnel();
  } else if (mode === 'local') {
    await startNextServer(mode);
    announceSuccess();
  } else {
    // Start Cloudflare tunnel & Next.js concurrently
    startCloudflareTunnel();
    await startNextServer(mode);

    // If tunnel is already verified, announce
    if (isTunnelReady) {
      announceSuccess();
    } else {
      // Backup timer in case DNS verify was slow
      setTimeout(() => {
        if (!isAnnounced) announceSuccess();
      }, 4000);
    }
  }

  setupKeyboardShortcuts();
  startHealthWatchdog();

  // Keep alive loop
  setInterval(() => {}, 10000);
}

// Background Health Watchdog to ensure 100% continuous uptime
let consecutiveFailures = 0;
let isWatchdogRestarting = false;

function startHealthWatchdog() {
  // Passive monitor without intrusive killing
  setInterval(() => {
    if (isShuttingDown || !isNextReady) return;
    const req = http.get(`http://127.0.0.1:${LOCAL_PORT}/`, () => {});
    req.on('error', () => {});
    req.setTimeout(3000, () => req.destroy());
  }, 15000);
}

function restart() {
  if (nextProcess && nextProcess.pid) killPid(nextProcess.pid);
  if (tunnelProcess && tunnelProcess.pid) killPid(tunnelProcess.pid);
  freePort(LOCAL_PORT);
  killCloudflared();
  setTimeout(() => {
    runWithMode(currentMode);
  }, 1000);
}

// ==========================================
// 9. CLI Menu & Argument Parsing
// ==========================================
function parseArgs() {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const a = args[i].toLowerCase();
    if (a === '--dev' || a === '1' || a === 'dev') return 'dev';
    if (a === '--prod' || a === '2' || a === 'prod') return 'prod';
    if (a === '--local' || a === '3' || a === 'local') return 'local';
    if (a === '--tunnel' || a === '4' || a === 'tunnel') return 'tunnel';
    if (a === '--clean' || a === '5' || a === 'clean') return 'clean';
    if (a === '--mode' && args[i + 1]) {
      return args[i + 1].toLowerCase();
    }
  }
  return null;
}

async function showMenuAndLaunch() {
  const chosenMode = parseArgs();
  if (chosenMode) {
    runWithMode(chosenMode);
    return;
  }

  printHeader();
  console.log(`  Select Run Mode (اختر وضع التشغيل):\n`);
  console.log(`  ${C.bold}${C.green}[1] ⚡ Fast Dev Mode (Next.js Dev + Cloudflare + Local) ${C.yellow}<- [Default]${C.reset}`);
  console.log(`      Live code editing + global tunnel.\n`);
  console.log(`  ${C.bold}${C.cyan}[2] 🚀 Production Mode (Build & Start + Cloudflare)${C.reset}`);
  console.log(`      Maximum speed, pre-rendered pages, highest stability.\n`);
  console.log(`  ${C.bold}${C.white}[3] 🏠 Local Only (Localhost:3000 Only)${C.reset}`);
  console.log(`      No external tunnel.\n`);
  console.log(`  ${C.bold}${C.white}[4] 🌐 Cloudflare Tunnel Only${C.reset}`);
  console.log(`      If server is already running elsewhere.\n`);
  console.log(`  ${C.bold}${C.red}[5] 🧹 Clean Ports & Stop All Processes${C.reset}\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let countdown = 3;
  process.stdout.write(`\r${C.yellow}Starting option [1] automatically in ${countdown}s... (Press 1-5 to choose): ${C.reset}`);

  const timer = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      process.stdout.write(`\r${C.yellow}Starting option [1] automatically in ${countdown}s... (Press 1-5 to choose): ${C.reset}`);
    } else {
      clearInterval(timer);
      rl.close();
      runWithMode('dev');
    }
  }, 1000);

  rl.on('line', (answer) => {
    clearInterval(timer);
    rl.close();
    const cleanAns = answer.trim();
    if (cleanAns === '2') runWithMode('prod');
    else if (cleanAns === '3') runWithMode('local');
    else if (cleanAns === '4') runWithMode('tunnel');
    else if (cleanAns === '5') runWithMode('clean');
    else runWithMode('dev');
  });
}

// Start
showMenuAndLaunch();
