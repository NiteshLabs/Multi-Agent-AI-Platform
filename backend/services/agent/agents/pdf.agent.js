import PDFDocument from "pdfkit"
import { getModel } from "../config/llmModel.js"
import { generatePdf } from "../utils/generatePdf.js"
import { getFromS3 } from "../utils/getFromS3.js"
import { uploadToS3 } from "../utils/uploadToS3.js"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"

export const pdfAgent = async (state) => {
    try {
        await checkAgentLimit(state.userId, "pdf")
        const llm = await getModel("pdf")
        const prompt = `
You are an expert document writer.

Return ONLY valid JSON.

Do NOT return markdown.

Do NOT return explanations.

Structure:

{
  "title":"",
  "subtitle":"",
  "sections":[
    {
      "heading":"",
      "points":[]
    }
  ]
}
Generate 4-8 sections.
Each section should have 3-6 concise bullet points.

Topic:
${state.prompt}

`
        const res = await llm.invoke(prompt)
        const data = JSON.parse(res.content)
        await deductCredits(state.userId, "pdf")
        const pdfBuffer = await generatePdf(data)

        const filename = `pdf-${Date.now()}.pdf`
        await uploadToS3(filename, pdfBuffer, "application/pdf")
        // 24h so the review panel still works when the chat is reopened later
        const downloadUrl = await getFromS3(filename, 24 * 60 * 60)

        // Plain-text outline shown in the review panel's "Content" tab
        const outline = [
            `# ${data.title}`,
            data.subtitle ? `_${data.subtitle}_` : "",
            ...(data.sections || []).map(s =>
                `## ${s.heading}\n${(s.points || []).map(p => `- ${p}`).join("\n")}`)
        ].filter(Boolean).join("\n\n")

        return {
            ...state,
            aiResponse: `
# PDF Generated

**${data.title}**

📥 [Download PDF](${downloadUrl})

_Link expires in 24 hours._
`,
            artifacts: [
                {
                    id: Date.now(),
                    type: "pdf",
                    title: data.title,
                    url: downloadUrl,
                    files: [{ name: "content.md", content: outline }]
                }
            ]
        }
    } catch (error) {
        console.log(error)
        if (error.status == 429) {
            return {
                ...state,
                aiResponse: error?.data?.message
            }
        }
        return {
            ...state,
            aiResponse: "Failed to Generate PDF"
        }
    }
}