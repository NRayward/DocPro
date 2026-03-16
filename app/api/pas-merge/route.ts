import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const policy_ref = searchParams.get('policy_ref')
  const customer_ref = searchParams.get('customer_ref')

  if (policy_ref) {
    const { data: policy } = await sb.from('policies')
      .select(`*, customers(first_name, last_name, email, mobile, phone, address_line1, address_line2, city, postcode, date_of_birth)`)
      .eq('policy_number', policy_ref)
      .single()

    if (!policy) return NextResponse.json({})

    const c = policy.customers as any
    const renewalDate = policy.renewal_date ? new Date(policy.renewal_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
    const startDate = policy.start_date ? new Date(policy.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
    const endDate = policy.end_date ? new Date(policy.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

    return NextResponse.json({
      '{{CUSTOMER_NAME}}': c ? `${c.first_name} ${c.last_name}` : '',
      '{{FIRST_NAME}}': c?.first_name || '',
      '{{LAST_NAME}}': c?.last_name || '',
      '{{EMAIL}}': c?.email || '',
      '{{PHONE}}': c?.mobile || c?.phone || '',
      '{{ADDRESS_LINE1}}': c?.address_line1 || '',
      '{{ADDRESS_LINE2}}': c?.address_line2 || '',
      '{{CITY}}': c?.city || '',
      '{{POSTCODE}}': c?.postcode || '',
      '{{POLICY_NUMBER}}': policy.policy_number || '',
      '{{PRODUCT_TYPE}}': policy.product_type || '',
      '{{POLICY_STATUS}}': policy.status || '',
      '{{START_DATE}}': startDate,
      '{{END_DATE}}': endDate,
      '{{RENEWAL_DATE}}': renewalDate,
      '{{PREMIUM_AMOUNT}}': policy.premium_gross ? `£${parseFloat(policy.premium_gross).toFixed(2)}` : '',
      '{{PREMIUM_NET}}': policy.premium_net ? `£${parseFloat(policy.premium_net).toFixed(2)}` : '',
      '{{IPT_AMOUNT}}': policy.ipt_amount ? `£${parseFloat(policy.ipt_amount).toFixed(2)}` : '',
      '{{PAYMENT_FREQUENCY}}': policy.payment_frequency || '',
    })
  }

  if (customer_ref) {
    const customerId = parseInt(customer_ref.replace('CUST-', ''))
    const { data: c } = await sb.from('customers').select('*').eq('id', customerId).single()
    if (!c) return NextResponse.json({})
    return NextResponse.json({
      '{{CUSTOMER_NAME}}': `${c.first_name} ${c.last_name}`,
      '{{FIRST_NAME}}': c.first_name || '',
      '{{LAST_NAME}}': c.last_name || '',
      '{{EMAIL}}': c.email || '',
      '{{PHONE}}': c.mobile || c.phone || '',
      '{{ADDRESS_LINE1}}': c.address_line1 || '',
      '{{POSTCODE}}': c.postcode || '',
    })
  }

  return NextResponse.json({})
}
