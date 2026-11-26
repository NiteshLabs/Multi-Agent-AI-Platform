// Runs the gateway and all four services in ONE Node process.
//
// Used for hosting on a single small instance (e.g. Render's free tier, 512 MB):
// five separate Node processes need ~540 MB, one process shares the runtime.
// Local development still uses `npm start` at the repo root (start-all.js),
// which runs each service on its own.
//
// Each service reads process.env.PORT when its module is loaded, so we set PORT
// before importing each one. Only the gateway listens on the public port; the
// services listen on fixed internal ports and talk over 127.0.0.1.

const publicPort = process.env.PORT || 8000

const services = [
    { name: "auth", port: 8001, entry: "./services/auth/index.js" },
    { name: "chat", port: 8002, entry: "./services/chat/index.js" },
    { name: "agent", port: 8003, entry: "./services/agent/index.js" },
    { name: "billing", port: 8004, entry: "./services/billing/index.js" },
]

// Services find each other on localhost inside this process.
process.env.AUTH_SERVICE = "http://127.0.0.1:8001"
process.env.CHAT_SERVICE = "http://127.0.0.1:8002"
process.env.AGENT_SERVICE = "http://127.0.0.1:8003"
process.env.BILLING_SERVICE = "http://127.0.0.1:8004"

for (const svc of services) {
    process.env.PORT = String(svc.port)
    await import(svc.entry)
}

process.env.PORT = String(publicPort)
await import("./gateway/index.js")

console.log(`[server] all services loaded; gateway on public port ${publicPort}`)

// Keep-alive: Render's free plan sleeps after 15 minutes without inbound
// traffic. Pinging our own PUBLIC url (through Render's proxy, so it counts as
// inbound traffic) every 10 minutes keeps the instance awake.
// Render sets RENDER_EXTERNAL_URL automatically; KEEP_ALIVE_URL overrides it.
// Nothing runs locally, where neither variable is set.
const keepAliveUrl = process.env.KEEP_ALIVE_URL || process.env.RENDER_EXTERNAL_URL
if (keepAliveUrl) {
    const intervalMs = 10 * 60 * 1000
    setInterval(async () => {
        try {
            const res = await fetch(keepAliveUrl, { signal: AbortSignal.timeout(30_000) })
            console.log(`[keep-alive] ${res.status}`)
        } catch (err) {
            console.log(`[keep-alive] ping failed: ${err.message}`)
        }
    }, intervalMs)
    console.log(`[keep-alive] pinging ${keepAliveUrl} every 10 minutes`)
}
