import { getModel } from "../config/llmModel.js"
import { generatePpt } from "../utils/generatePpt.js"
import { uploadToS3 } from "../utils/uploadToS3.js"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"
import { getFromS3 } from "../utils/getFromS3.js"

export const pptAgent = async (state) => {
    try {await checkAgentLimit(state.userId,"ppt")
        const llm = await getModel("ppt")
        const prompt = `
    You are a professional presentation designer.
    Return only valid JSON.
    
    {
  "title": "",
  "subtitle": "",
  "slides": [
    {
      "title": "",
      "points": [
        "",
        "",
        "",
        ""
      ]
    }
  ]
}
  Rules:

- Generate exactly 6 content slides.
- Each slide should have 4–6 concise bullet points.
- No markdown.
- No explanation.
- No code block.
- Return ONLY JSON.

Topic:

${state.prompt}
    `
        const res = await llm.invoke(prompt)
        //   console.log(JSON.parse(res.content))
        const data = JSON.parse(res.content)
        await deductCredits(state.userId,"ppt")
        const ppt = await generatePpt(data)
        const buffer = await ppt.write({
            outputType: "nodebuffer"
        })

        const filename = `ppt-${Date.now()}.pptx`
        await uploadToS3(filename,buffer,"application/vnd.openxmlformats-officedocument.presentationml.presentation");

        const downloadUrl = await getFromS3(filename, 24 * 60 * 60);

        // Plain-text outline shown in the side viewer's "Content" tab
        const outline = [
            `# ${data.title}`,
            data.subtitle ? `_${data.subtitle}_` : "",
            ...(data.slides || []).map((s, i) =>
                `## Slide ${i + 1}: ${s.title}\n${(s.points || []).map(p => `- ${p}`).join("\n")}`)
        ].filter(Boolean).join("\n\n")

        return {
            ...state,
            aiResponse: `
# ✅ Presentation Generated

**${data.title}**

📥 [Download PPT](${downloadUrl})

_Link expires in 24 hours._
`,
            artifacts: [
                {
                    id: Date.now(),
                    type: "ppt",
                    title: data.title,
                    url: downloadUrl,
                    files: [{ name: "slides.md", content: outline }]
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
            aiResponse:"Failed to generate ppt.."
        }
    }
}