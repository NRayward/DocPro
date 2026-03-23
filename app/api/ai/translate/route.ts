import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: Request) {
  const { letter, language } = await req.json()

  if (!letter || !language) {
    return NextResponse.json({ error: 'letter and language are required' }, { status: 400 })
  }

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `You are a professional translator specialising in insurance and legal correspondence.

Translate the following insurance letter into ${language}.

Rules:
- Translate ALL natural language text into ${language}
- Keep ALL merge fields EXACTLY as they are in double curly braces, e.g. {{CUSTOMER_NAME}}, {{POLICY_NUMBER}} — do NOT translate these
- Translate "Dear {{CUSTOMER_NAME}}," and "Yours sincerely," into their ${language} equivalents
- Maintain a professional, formal tone appropriate for insurance correspondence
- Output ONLY the translated letter body — no explanations, no preamble

Letter to translate:
${letter}`
    }]
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return NextResponse.json({ text })
}
