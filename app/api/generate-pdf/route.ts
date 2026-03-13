import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(req: Request) {
  const { letterBody, documentId } = await req.json()

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #1a1f2e; }
        .header { border-bottom: 3px solid #f97316; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #1a1f2e; }
        .body { font-size: 14px; line-height: 1.8; white-space: pre-wrap; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e8ef; font-size: 11px; color: #9ca3af; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">RDT</div>
        <div style="font-size:12px; color:#6b7280; margin-top:4px">Insurance Technology</div>
      </div>
      <div class="body">${letterBody || "No letter content provided."}</div>
      <div class="footer">RDT Limited · Registered in England & Wales No. 12345678</div>
    </body>
    </html>
  `

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true
    })

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({ format: 'A4', margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' } })
    await browser.close()

    const fileName = `document-${documentId || Date.now()}.pdf`
    const { error } = await supabase.storage
      .from('documents')
      .upload(fileName, pdf, { contentType: 'application/pdf', upsert: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data } = supabase.storage.from('documents').getPublicUrl(fileName)
    return NextResponse.json({ url: data.publicUrl })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
