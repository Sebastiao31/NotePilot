import { NextRequest } from "next/server"
import OpenAI from "openai"
import { TITLE_PROMPT } from "@/constants"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text || typeof text !== "string") {
      return new Response("Missing text", { status: 400 })
    }

    const client = new OpenAI({ apiKey: process.env.NEXT_OPENAI_API })
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: TITLE_PROMPT },
        { role: "user", content: text.slice(0, 10000) },
      ],
      temperature: 0.4,
      max_tokens: 30,
    })

    const title = completion.choices[0]?.message?.content?.trim()?.replace(/^"|"$/g, "") ?? "Untitled Note"
    return Response.json({ title })
  } catch (e) {
    return new Response("Failed to generate title", { status: 500 })
  }
}


