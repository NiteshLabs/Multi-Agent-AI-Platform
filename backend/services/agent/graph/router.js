import { getModel } from "../config/llmModel.js"

export const router = async (state) => {
    // An attached file decides the agent, whatever agent chip is selected:
    // a question about an uploaded PDF must go to pdfRag, not the PDF generator.
    if (state.file) {
        if (state.file.mimetype === "application/pdf") {
            return {
                ...state,
                agent: "pdfRag"
            }
        }

        if (state.file.mimetype.startsWith("image/")) {
            return {
                ...state,
                agent: "imageAnalyzer"
            }
        }
    }

    if (state.agent && state.agent != "auto") {
        return {
            ...state,
            agent: state.agent
        }
    }

    const llm = await getModel("router")
    const prompt = ` you are an agent router.
    
    Available agents:
    
    -chat
    -search
    -coding
    -pdf
    -ppt
    -vision

    Rules:

    chat:
    General conversation,
    explanation,
    learning,
    questions.

    search:
    Current events,
    latest information,
    news,
    recent development,
    internet lookup.

    coding:
    Generate code,
    debug code,
    build projects,
    architecture,
    API design.

    pdf:
    Questions about generate PDFs
    or document context.

    ppt:
    Questions about generate ppts
    or ppt context.

    vision:
    Geberate Image,
    create Image,
    make changes in image.

    return only one word :
    chat
    search
    coding
    pdf
    vision

    User Query:${state.prompt}
    `

    const response = await llm.invoke(prompt)
    // console.log(response)
    return {
        ...state,
        agent: response.content.trim().toLowerCase()
    }

}