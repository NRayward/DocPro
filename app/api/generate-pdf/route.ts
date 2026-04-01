import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { RDT_LOGO } from '@/lib/logo'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(req: Request) {
  const { letterBody, documentId, mergeData } = await req.json()

  // Apply merge fields to letter body
  let mergedBody = letterBody || ""
  if (mergeData && typeof mergeData === "object") {
    Object.entries(mergeData).forEach(([k, v]: [string, any]) => {
      mergedBody = mergedBody.split(k).join(String(v ?? ""))
    })
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #1a1f2e; }
        .header { padding: 24px 40px 20px; border-bottom: 3px solid #f97316; display: flex; align-items: center; justify-content: space-between; }
        .logo { height: 66px; width: 198px; object-fit: contain; }
        body: .content { padding: 32px 40px 20px; }message,
        .address { font-size: 12px; color: #6b7280; margin-bottom: 24px; line-height: 1.6; }
        .body { font-size: 13px; line-height: 1.8; white-space: pre-wrap; margin-bottom: 32px; }
        .footer { background: #1a1f2e; padding: 10px 40px; display: flex; justify-content: space-between; align-items: center; margin-top: 60px; }
        .footer-left { font-size: 10px; color: rgba(255,255,255,0.6); }
        .footer-right { font-size: 10px; color: rgba(255,255,255,0.5); }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${RDT_LOGO}" class="logo" alt="RDT" />
        <div style="font-size:11px; color:#6b7280; text-align:right; line-height:1.6">
          RDT Limited<br/>
          Birmingham, UK<br/>
          www.rdtltd.com
        </div>
      </div>
      <div class="content">
        <div class="address">
          ${mergeData?.["{{CUSTOMER_NAME}}"] || ""}<br/>
          ${mergeData?.["{{ADDRESS_LINE1}}"] || ""}<br/>
          ${mergeData?.["{{POSTCODE}}"] || ""}
        </div>
        <div class="body">${( mergedBody).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
      </div>
      <div class="footer">
        <div class="footer-left">RDT Limited &middot; Registered in England &amp; Wales No. 12345678</div>
        <div class="footer-right">Confidential</div>
      </div>
    </body>
    </html>
  `

  try {
    const pdfRes = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`api:${process.env.PDFSHIFT_API_KEY}`).toString('base64')
      },
      body: JSON.stringify({ source: html, landscape: false, use_print: false })
    })

    if (!pdfRes.ok) {
      const err = await pdfRes.text()
      return NextResponse.json({ error: err }, { status: 500 })
    }

    const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer())
    const fileName = `document-${documentId || Date.now()}.pdf`

    const { error } = await supabase.storage
      .from('documents')
      .upload(fileName, pdfBuffer, { contentType: 'application/pdf', upsert: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data } = supabase.storage.from('documents').getPublicUrl(fileName)
    return NextResponse.json({ url: data.publicUrl })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
