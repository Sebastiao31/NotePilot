import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.NEXT_OPENAI_API })

export async function POST(req: NextRequest) {
  try {
    const { title, content } = await req.json()

    const prompt = `Create a set of flashcards (10-15) about the following note. Ensure the flashcards are in the same language as the note. Output strict JSON ONLY with the schema: {"cards":[{"front":"...","back":"..."}...]}. The front should be a concise prompt or question; the back should be the concise answer.

Include mathematical expressions using LaTeX delimiters:
- Inline: $...$ (e.g., $A=\\pi r^2$)
- Block/display: $$...$$ (e.g., $$F = G \\frac{m_1 \\cdot m_2}{d^2}$$)
Do NOT use Markdown code fences for math.

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

    const raw = completion.choices[0]?.message?.content || '{"cards":[]}'
    const parsed = JSON.parse(raw)
    return NextResponse.json({ cards: parsed.cards || [] })
  } catch (e) {
    console.error('generate-flashcards failed', e)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}


