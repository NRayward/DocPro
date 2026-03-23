import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { prompt, tone, recipient } = await req.json()

    if (!prompt || !recipient) {
      return NextResponse.json({ error: 'prompt and recipient are required' }, { status: 400 })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
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
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic error:', response.status, err)
      return NextResponse.json({ error: `API error ${response.status}` }, { status: 500 })
    }

    const data = await response.json()
    const text = data.content?.find((b: any) => b.type === 'text')?.text || ''
    return NextResponse.json({ text })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Generate error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
