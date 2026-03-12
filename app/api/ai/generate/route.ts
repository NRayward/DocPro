import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: Request) {
  const { prompt, tone, recipient } = await req.json()

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `You are a professional insurance correspondence writer for RDT Limited.
      
Write the BODY CONTENT ONLY of a letter based on the following:

Recipient: ${recipient}
Tone: ${tone}
Instructions: ${prompt}

Rules:
- Start with "Dear {{CUSTOMER_NAME}},"
- Use merge fields like {{POLICY_NUMBER}}, {{RENEWAL_DATE}}, {{PREMIUM_AMOUNT}}
- Write 2-4 concise paragraphs
- End with "Yours sincerely,"
- Plain text only, no markdown`
    }]
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return NextResponse.json({ text })
}