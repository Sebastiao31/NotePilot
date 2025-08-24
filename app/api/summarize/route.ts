import OpenAI from "openai"
import { NextResponse } from "next/server"
import { SUMMARIZE_PROMPT } from "@/constants"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type RequestBody = {
  text: string
}

export async function POST(req: Request) {
  try {
    const { text } = (await req.json()) as RequestBody
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing text" }, { status: 400 })
    }

    const apiKey = process.env.NEXT_OPENAI_API
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server missing NEXT_OPENAI_API" },
        { status: 500 }
      )
    }

    const client = new OpenAI({ apiKey })
    const userPrompt = SUMMARIZE_PROMPT.userTemplate.replace("{text}", text)

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SUMMARIZE_PROMPT.system },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
    })

    const summary = completion.choices?.[0]?.message?.content ?? ""
    return NextResponse.json({ summary })
  } catch (error: unknown) {
    console.error("/api/summarize error", error)
    return NextResponse.json({ error: "Failed to summarize" }, { status: 500 })
  }
}


