import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages"
import { getModel } from "../config/llmModel.js"
import { getMemory } from "../config/memory.js"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"

const formatSearchContext = (searchResults) => {
    if (!searchResults) return "";

    let items = [];
    if (Array.isArray(searchResults.results)) {
        items = searchResults.results;
    } else if (Array.isArray(searchResults)) {
        items = searchResults;
    }

    if (items.length > 0) {
        const directAnswer = searchResults.answer ? `Direct Summary: ${searchResults.answer}\n\n` : "";
        const formattedList = items.slice(0, 5).map((item, idx) => {
            const title = item.title ? item.title.trim() : `Source ${idx + 1}`;
            const url = item.url ? ` (${item.url})` : "";
            const snippet = (item.content || "")
                .replace(/\r?\n+/g, " ")
                .replace(/\s+/g, " ")
                .trim()
                .slice(0, 650);
            return `[${idx + 1}] ${title}${url}:\n${snippet}`;
        }).join("\n\n");

        return `
Web Search Results:
${directAnswer}${formattedList}

Answer the user's query comprehensively and accurately based on the above search results. Include citations or source references where appropriate.
`;
    }

    if (typeof searchResults === "string" && searchResults.trim()) {
        return `
Web Search Results:
${searchResults.slice(0, 2000)}

Answer the user's query using the above search results.
`;
    }

    return "";
};

export const chatAgent = async (state) => {
    try {
        // If an upstream agent (like searchAgent) already set an error response, return it directly
        if (state.aiResponse) {
            return state;
        }

        // Only check/deduct chat limits if this isn't already handled by another agent
        if (state.agent !== "search") {
            await checkAgentLimit(state.userId, "chat");
        }

        const llm = await getModel("chat");
        const history = await getMemory(state.conversationId);

        const searchContext = formatSearchContext(state.searchResults);

        const systemPrompt = `
You are CortexAI, an intelligent AI assistant.

${searchContext}

if searchContext exists:
- Use search results to answer
- Do not mention internal tools or JSON formatting.

Rules:
- For simple questions, greetings and short queries, respond naturally in plain text.
- For technical, educational, coding or detailed topics use clean Markdown.
Formatting:
- Use # for titles and ## for sections.
- Leave a blank line after headings.
- Use bullet points for lists.
- Use numbered lists for steps.
- Use fenced code blocks with language tags for code.
- Keep paragraphs short and readable.
- Never write headings and content on the same line.
- Never generate large walls of text.
`;
        const messages = [
            new SystemMessage(systemPrompt)
        ];

        const recentHistory = Array.isArray(history) ? history.slice(-6) : [];
        recentHistory.forEach(msg => {
            if (msg.role == "user" && msg.content) {
                messages.push(new HumanMessage(msg.content));
            }
            if (msg.role == "assistant" && msg.content) {
                if (!msg.content.startsWith("❌")) {
                    messages.push(new AIMessage(msg.content.slice(0, 1000)));
                }
            }
        });
        messages.push(new HumanMessage(state.prompt));

        let response;
        try {
            response = await llm.invoke(messages);
        } catch (llmError) {
            console.warn("Primary LLM failed, trying fallback model:", llmError.message);
            const fallbackLlm = await getModel("chatFallback");
            if (fallbackLlm) {
                response = await fallbackLlm.invoke(messages);
            } else {
                throw llmError;
            }
        }

        if (state.agent !== "search") {
            await deductCredits(state.userId, "chat");
        }

        return {
            ...state,
            aiResponse: response.content
        };
    } catch (error) {
        console.error("Chat agent error:", error);

        if (error.status == 429) {
            return {
                ...state,
                aiResponse: error?.data?.message || error?.error?.message || error?.message || "Rate limit reached. Please wait a moment."
            };
        }
        if (error.status == 413) {
            return {
                ...state,
                aiResponse: "⚠️ Context was too large. Please ask a more specific query."
            };
        }
        return {
            ...state,
            aiResponse: "❌ Failed to Generate Response"
        };
    }
};