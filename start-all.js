import { spawn } from "child_process";
import path from "path";
import net from "net";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const services = [
  { name: "AUTH", color: "\x1b[36m", cwd: path.join(__dirname, "backend", "services", "auth") },
  { name: "AGENT", color: "\x1b[35m", cwd: path.join(__dirname, "backend", "services", "agent") },
  { name: "BILLING", color: "\x1b[33m", cwd: path.join(__dirname, "backend", "services", "billing") },
  { name: "CHAT", color: "\x1b[32m", cwd: path.join(__dirname, "backend", "services", "chat") },
  { name: "GATEWAY", color: "\x1b[34m", cwd: path.join(__dirname, "backend", "gateway") },
  { name: "FRONTEND", color: "\x1b[31m", cwd: path.join(__dirname, "frontend") },
];

const RESET = "\x1b[0m";
const children = [];

function checkRedis() {
  const socket = new net.Socket();
  socket.setTimeout(1500);

  socket.on("connect", () => {
    console.log(`\x1b[32m[SYSTEM] Redis is running on localhost:6379.${RESET}`);
    socket.destroy();
  });

  socket.on("timeout", () => {
    console.log(`\x1b[33m[SYSTEM] Notice: Redis timeout on localhost:6379. If Redis is required for sessions, run:\n  docker compose -f backend/docker-compose.yml up -d${RESET}`);
    socket.destroy();
  });

  socket.on("error", () => {
    console.log(`\x1b[33m[SYSTEM] Notice: Redis is not reachable on localhost:6379.\nIf Redis is required for sessions/caching, run:\n  docker compose -f backend/docker-compose.yml up -d${RESET}`);
  });

  socket.connect(6379, "127.0.0.1");
}

function startService(svc) {
  const tag = `${svc.color}[${svc.name}]${RESET} `;
  console.log(`${tag}Starting in ${svc.cwd}...`);

  const child = spawn("npm", ["run", "dev"], {
    cwd: svc.cwd,
    shell: true,
    env: { ...process.env, FORCE_COLOR: "1" },
  });

  child.stdout.on("data", (data) => {
    const lines = data.toString().split("\n");
    for (const line of lines) {
      if (line.trim().length > 0) {
        console.log(`${tag}${line}`);
      }
    }
  });

  child.stderr.on("data", (data) => {
    const lines = data.toString().split("\n");
    for (const line of lines) {
      if (line.trim().length > 0) {
        console.error(`${tag}${line}`);
      }
    }
  });

  child.on("close", (code) => {
    console.log(`${tag}Exited with code ${code}`);
  });

  children.push(child);
}

function shutdown() {
  console.log(`\n\x1b[33m[SYSTEM] Shutting down all services...${RESET}`);
  for (const child of children) {
    if (child && child.pid) {
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", child.pid.toString(), "/T", "/F"], { stdio: "ignore" });
      } else {
        child.kill("SIGTERM");
      }
    }
  }
  process.exit();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log(`\x1b[1m\x1b[34m========================================\x1b[0m`);
console.log(`\x1b[1m\x1b[34m Starting Multi-Agent AI Platform Stack \x1b[0m`);
console.log(`\x1b[1m\x1b[34m========================================\x1b[0m`);

checkRedis();

for (const svc of services) {
  startService(svc);
}
