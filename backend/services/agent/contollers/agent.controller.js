import axios from "axios"
import { graph } from "../graph/graph.js"
import { addMessages } from "../config/memory.js"
import redis from "../../../shared/redis/redis.js"

export const agent = async (req, res, next) => {
    try {
        const { prompt, conversationId, agent } = req.body;
        const file = req.file
        const userId = req.headers["x-user-id"]

        console.log("Step 1");

        await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
            conversationId,
            role: "user",
            content: prompt
        });

        console.log("Step 2");
        console.log("req.file:", req.file);
        console.log("req.body:", req.body);
        const result = await graph.invoke({ prompt, conversationId, agent, userId, file });

        console.log("Step 3");

        const aiResponse = result.aiResponse;

        await addMessages({
            conversationId,
            role: "user",
            content: prompt
        });

        await addMessages({
            conversationId,
            role: "assistant",
            content: aiResponse
        });

        console.log("Step 5");

        await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
            conversationId,
            role: "assistant",
            content: aiResponse,
            images: result.images,
            artifacts: result.artifacts
        });

        console.log("Step 6");

        return res.status(200).json({
            answer: aiResponse,
            images: result.images,
            artifacts: result.artifacts
        });

    } catch (error) {
        next(error)
    }
}