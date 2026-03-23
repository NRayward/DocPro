import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { letter, language } = await req.json()

    if (!letter || !language) {
      return NextResponse.json({ error: 'letter and language are required' }, { status: 400 })
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
    console.error('Translate error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
