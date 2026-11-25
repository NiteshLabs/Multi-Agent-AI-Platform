// Cloudflare Pages Function: forwards every /api/* request to the backend
// (the gateway on Render). The browser only ever talks to this site, so the
// login cookie (SameSite=strict) stays first-party and no CORS setup is needed.
//
// Set BACKEND_URL in the Pages project settings, e.g. https://cortexai-api.onrender.com

export async function onRequest({ request, env }) {
    if (!env.BACKEND_URL) {
        return new Response(JSON.stringify({ message: "BACKEND_URL is not configured" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        })
    }

    const incoming = new URL(request.url)
    const target = new URL(incoming.pathname + incoming.search, env.BACKEND_URL)

    const headers = new Headers(request.headers)
    headers.delete("host")

    const hasBody = !["GET", "HEAD"].includes(request.method)

    const upstream = await fetch(target, {
        method: request.method,
        headers,
        body: hasBody ? request.body : undefined,
        redirect: "manual",
    })

    // fetch() has already decompressed the body, so drop the upstream encoding
    // headers and let Cloudflare compress for each visitor. Everything else,
    // including Set-Cookie, is passed back unchanged.
    const response = new Response(upstream.body, upstream)
    response.headers.delete("content-encoding")
    response.headers.delete("content-length")
    return response
}
