import { checkAgentLimit } from "../config/agentLimit.js"
import { getModel } from "../config/llmModel.js"
import { deductCredits } from "../utils/deductCredits.js"

export const codingAgent = async (state) => {
    try {
        await checkAgentLimit(state.userId, "coding")
        const intentLlm = await getModel("intent")
        const llm = await getModel("coding") 
        const intentRes = await intentLlm.invoke(`
You are an intent classifier.

Return ONLY one of these values.

CODE_GENERATION
CODE_REVIEW
CODE_EXPLANATION
DEBUGGING
OPTIMIZATION
CONVERSION
DOCUMENTATION

User Request:
${state.prompt}
    `)

        const intent = intentRes.content
        if (intent === "CODE_GENERATION") {
            const prompt = `
        You are CortexAI Coding Agent.
        Generate the requested project.

        Default stack:
        -HTML
        -CSS
        -JavaScript

        use React / Next.js ? Vue ONLY if explicitly requested.

        Rules:

        - Responsive
- Modern UI
- CSS Variables
- Flexbox/Grid
- Smooth Scroll
- Hover Effects
- Beautiful spacing
- Single page unless user asks otherwise.

Images
==========================

Always use real Unsplash images.
Never use placeholders.


Return ONLY valid JSON.

Schema:

{
  "files": [
    {
      "name": "index.html",
      "content": "..."
    },
    {
      "name": "style.css",
      "content": "..."
    },
    {
      "name": "script.js",
      "content": "..."
    }
  ]
}

Rules:

- Output must start with {
- Output must end with }
- No markdown
- No explanation
- No extra text
- No \`\`\`
- Never mention intent

User Request:
${state.prompt}

        `
            const res = await llm.invoke(prompt)
            let data;

            try {
                let content = res.content.trim();

                // Remove Markdown code fences if the model returns them
                content = content.replace(/```json|```/gi, "").trim();

                data = JSON.parse(content);
                await deductCredits(state.userId, "coding")
            } catch (err) {
                console.log("Invalid JSON from LLM:");
                console.log(res.content);

                return {
                    ...state,
                    aiResponse: "Failed to generate valid project JSON.",
                    artifacts: []
                };
            }
            return {
                ...state,
                aiResponse: "Code Generated Successfully",
                artifacts: [
                    {
                        id: Date.now(),
                        type: "Project",
                        files: data.files || [],
                        title: state.prompt
                    }
                ]

            }
        }
        const res = await llm.invoke(`
The user's request is:

${intent}

Return Markdown only.

Never generate project files.

Use headings like:

# Overview

## Explanation

## Problems

## Improvements

## Best Practices

## Optimized Code (if needed)

User Request:
${state.prompt}
    `)
        const data = res.content
        await deductCredits(state.userId, "coding")
        return {
            ...state,
            aiResponse: data,
            artifacts: []
        }

    } catch (error) {
        console.log(error)


        if (error.status == 429) {
            return {
                ...state,
                aiResponse: error?.data?.message,
                artifacts: []
            }
        }
        return {
            ...state,
            aiResponse: "❌ Failed to Generate Code",
            artifacts: []


        }
    }
}