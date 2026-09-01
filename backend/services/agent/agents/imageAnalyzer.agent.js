import { getModel } from "../config/llmModel.js";

import fs from "fs/promises"
import { deductCredits } from "../utils/deductCredits.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { checkAgentLimit } from "../config/agentLimit.js";

export const imageAnalyzer = async (state) => {
    try { await checkAgentLimit(state.userId,"vision")
        const llm = await getModel("imageAnalyzer")
        console.log(process.env.GOOGLE_API_KEY)

        const imageBuffer = await fs.readFile(state.file.path)
        const base64Image = imageBuffer.toString("base64")

        const messages = [
            new SystemMessage(`
You are CortexAI image analyzer Agent.

Rules:

- Analyze only the uploaded image.
- Answer the user's question accurately.
- If text exists in the image, extract it.
- If charts or tables exist, explain them.
- If something is unclear, say so.
- Use Markdown when helpful.
- Do not hallucinate.
`),
            new HumanMessage(
                {
                    content: [
                        {
                            type: "text",
                            text: state.prompt || "analyze the image"
                        },
                        {
                            type: "image_url",
                            "image_url": {
                                url: `data:${state.file.mimetype};base64,${base64Image}`
                            }
                        }
                    ]
                }
            )
        ]
        const response = await llm.invoke(messages)
        await deductCredits(state.userId, "vision")
        return {
            ...state,
            aiResponse: response.content
        }

    } catch (error) {
        console.log("error in imageanalyzer.agent.js", error)
        if (error.status == 429) {
            return {
                ...state,
                aiResponse: error?.data?.message
            }
        }
        return {
            ...state,
            aiResponse: "Failed to analyse file"
        }
    }
    finally {
        if (state.file?.path) {
            await fs.unlink(state.file.path).catch(console.error);
        }
    }
}