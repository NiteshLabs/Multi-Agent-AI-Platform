import { getModel } from "../config/llmModel.js"
import axios from "axios"
import { uploadToS3 } from "../utils/uploadToS3.js"
import { getFromS3 } from "../utils/getFromS3.js"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

// Pollinations' free tier allows 1 image per 45s per IP (HTTP 402 "FREE_LIMIT")
// and sometimes answers 503 when busy. Retry those instead of failing at once.
// Optional POLLINATIONS_API_KEY (a "pollen" key from enter.pollinations.ai)
// removes the rate limit.
export const fetchImage = async (prompt, attempts = 3) => {
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true`
    const headers = process.env.POLLINATIONS_API_KEY
        ? { Authorization: `Bearer ${process.env.POLLINATIONS_API_KEY}` }
        : {}
    for (let i = 1; ; i++) {
        try {
            return await axios.get(url, { responseType: "arraybuffer", timeout: 90_000, headers })
        } catch (error) {
            const status = error.response?.status
            const retryable = [402, 429, 500, 502, 503, 504].includes(status) || error.code === "ECONNABORTED"
            if (!retryable || i >= attempts) throw error
            // The 402 body says "Retry after Ns"; otherwise back off 5s, 10s.
            let waitMs = 5000 * i
            try {
                const body = JSON.parse(Buffer.from(error.response?.data || "").toString())
                const secs = Number(/Retry after (\d+)s/i.exec(body?.error?.message || "")?.[1])
                if (secs) waitMs = Math.min((secs + 1) * 1000, 50_000)
            } catch { /* body wasn't JSON */ }
            console.log(`Image service returned ${status ?? error.code}; retry ${i}/${attempts - 1} in ${waitMs / 1000}s`)
            await sleep(waitMs)
        }
    }
}

// Cloudflare Workers AI, FLUX.1 schnell: free daily allowance (10,000 neurons/day,
// reset 00:00 UTC). Needs CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_AI_TOKEN.
const fetchCloudflareImage = async (prompt) => {
    const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_AI_TOKEN } = process.env
    const res = await axios.post(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
        { prompt, steps: 4 },
        { headers: { Authorization: `Bearer ${CLOUDFLARE_AI_TOKEN}` }, timeout: 60_000 }
    )
    const image = res.data?.result?.image
    if (!res.data?.success || !image) {
        throw new Error(`Cloudflare image failed: ${JSON.stringify(res.data?.errors || "no image")}`)
    }
    return { buffer: Buffer.from(image, "base64"), contentType: "image/jpeg" }
}

// Cloudflare first (fast, no per-minute limit); Pollinations if Cloudflare is not
// configured, its daily allowance is used up, or it refuses/fails the prompt.
export const generateImage = async (prompt) => {
    if (process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_AI_TOKEN) {
        try {
            return await fetchCloudflareImage(prompt)
        } catch (error) {
            const detail = error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : error.message
            console.log("Cloudflare image generation failed, falling back to Pollinations:", detail)
        }
    }
    const res = await fetchImage(prompt)
    return {
        buffer: Buffer.from(res.data),
        contentType: res.headers["content-type"]?.split(";")[0] || "image/jpeg"
    }
}

export const visionAgent = async (state) => {
    try {await checkAgentLimit(state.userId,"vision")
        const llm = await getModel("image")
        const res = await llm.invoke(`
    You are an elite AI image prompt engineer.

Convert the user request into a highly detailed image generation prompt.

Requirements:

- Cinematic lighting
- Professional composition
- Ultra realistic
- High detail
- Beautiful color palette
- Sharp focus
- 8K quality
- Photorealistic
- Depth of field
- Professional photography
- Stunning visuals

Return only the image prompt, in at most 60 words.

User Request:
${state.prompt}
`)

        const prompt = res.content.trim()

        const { buffer, contentType } = await generateImage(prompt)
        await deductCredits(state.userId,"vision")
        // Store the image with its real type (both providers usually return JPEG).
        const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg"
        const filename = `image-${Date.now()}.${ext}`
        await uploadToS3(filename, buffer, contentType)
        const downloadUrl = await getFromS3(filename, 24 * 60 * 60)

        return {
            ...state,
            aiResponse: `


![Generated Image](${downloadUrl})

📥 [Download Image](${downloadUrl})

⏳ Link expires in 24 hours.
`
        }
    } catch (error) {
        console.log("Error in vision.agent.js:", error.response?.status ?? error.code ?? "", error.message)
        if (error.status == 429) {
            return {
                ...state,
                aiResponse: error?.data?.message
            }
        }
        const status = error.response?.status
        if ([402, 429, 500, 502, 503, 504].includes(status) || error.code === "ECONNABORTED") {
            return {
                ...state,
                aiResponse: "❌ The image service is busy right now (its free tier allows one image every 45 seconds). Please try again in a minute."
            }
        }
        return {
            ...state,
            aiResponse: "❌ Failed to Generate Image"


        }
    }


}