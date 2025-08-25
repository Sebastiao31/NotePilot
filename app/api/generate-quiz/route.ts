import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.NEXT_OPENAI_API })

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const { title, content } = await req.json()

    const prompt = `Create a multiple-choice quiz (10-15 questions) about the following note. Ensure questions and options are in the language of the note.
Output strict JSON only (no markdown, no prose):
{"questions":[{"q":"...","options":["A","B","C","D"],"correct":0} ...]}

Rules:
- Exactly 4 options per question.
- "correct" is a 0-based index (0..3) and must match one of the options.
- Concise strings; avoid quotes or extra punctuation.
- Math: If formulas/numbers are present, use LaTeX delimiters.
  - Inline: $...$
  - Display: $$...$$ (on its own line)
  - Do not use code fences; use LaTeX only.

Title: ${title}
Content:
${content}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You produce compact JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' } as any,
    })

    const raw = completion.choices[0]?.message?.content || '{"questions":[]}'
    const parsed = JSON.parse(raw)
    return NextResponse.json({ questions: parsed.questions || [] })
  } catch (e) {
    console.error('generate-quiz failed', e)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}


