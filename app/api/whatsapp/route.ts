import twilio from 'twilio'
import { NextResponse } from 'next/server'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

export async function POST(req: Request) {
  const { to, message, mediaUrl } = await req.json()

  if (!to || !message) {
    return NextResponse.json({ error: "Missing to or message" }, { status: 400 })
  }

  try {
    const params: any = {
      from: process.env.TWILIO_WHATSAPP_FROM!,
      to: `whatsapp:${to}`,
      body: message
    }

    if (mediaUrl) {
      params.mediaUrl = [mediaUrl]
    }

    const result = await client.messages.create(params)
    return NextResponse.json({ success: true, sid: result.sid })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
