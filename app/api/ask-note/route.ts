import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.NEXT_OPENAI_API })

export async function POST(req: NextRequest) {
  try {
    const { question, context } = await req.json()
    if (!question || !context) {
      return NextResponse.json({ error: 'Missing question or context' }, { status: 400 })
    }

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content:
          'You are a helpful assistant that answers questions about a note. Be concise and reference specific parts where relevant. Use Markdown. If uncertain, say so briefly.',
      },
      { role: 'user', content: `Context:\n${context}\n\nQuestion: ${question}` },
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.3,
      max_tokens: 300,
    })

    const answer = completion.choices[0]?.message?.content?.trim() || 'No answer.'
    return NextResponse.json({ answer })
  } catch (e) {
    console.error('ask-note error', e)
    return NextResponse.json({ error: 'Failed to answer' }, { status: 500 })
  }
}


