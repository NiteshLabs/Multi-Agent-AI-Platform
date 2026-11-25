import { checkAgentLimit } from "../config/agentLimit.js"
import { searchTool } from "../config/tavily.js"
import { deductCredits } from "../utils/deductCredits.js"

export const searchAgent = async (state) => {
    try {
        await checkAgentLimit(state.userId, "search")
        const results = await searchTool.invoke({
            query: state.prompt
        })
        await deductCredits(state.userId, "search")
        console.log("search is agent")
        const topImages = Array.isArray(results?.images) ? results.images.slice(0, 5) : [];
        return {
            ...state,
            searchResults: results,
            images: topImages
        }
    } catch (error) {
        console.error("Search agent error:", error);
        if (error.status == 429) {
            return {
                ...state,
                searchResults: null,
                images: [],
                aiResponse: error?.data?.message || "Search rate limit reached. Please wait a moment."
            }
        }
        return {
            ...state,
            searchResults: null,
            images: []
        }
    }
}