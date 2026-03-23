import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: Request) {
  const { prompt, tone, recipient } = await req.json()

  if (!prompt || !recipient) {
    return NextResponse.json({ error: 'prompt and recipient are required' }, { status: 400 })
  }

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `You are a professional insurance correspondence writer for RDT Limited, an insurance technology company based in Birmingham, UK.

Write the BODY CONTENT ONLY of a letter based on the following instructions:

Recipient: ${recipient}
Tone: ${tone || 'professional'}
Instructions: ${prompt}

Rules:
- Start with "Dear {{CUSTOMER_NAME}},"
- Where relevant, use merge fields in double curly braces: {{POLICY_NUMBER}}, {{RENEWAL_DATE}}, {{PREMIUM_AMOUNT}}, {{NCD_YEARS}}, {{CLAIM_REFERENCE}}
- Write 2-4 concise paragraphs
- End with "Yours sincerely,"
- Do NOT include letterhead, address block, signature block or date — those are added automatically
- Plain text only, no markdown, no bullet points`
    }]
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return NextResponse.json({ text })
}
