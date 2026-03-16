import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const type = searchParams.get('type') || 'policy'

  if (q.length < 2) return NextResponse.json([])

  if (type === 'policy') {
    const { data } = await sb.from('policies')
      .select('id, policy_number, status, product_type, customer_id, customers(first_name, last_name)')
      .or(`policy_number.ilike.%${q}%`)
      .limit(10)
    return NextResponse.json((data || []).map((p: any) => ({
      id: p.policy_number,
      ref: p.policy_number,
      type: 'policy',
      name: p.customers ? `${p.customers.first_name} ${p.customers.last_name}` : 'Unknown',
      status: p.status,
      detail: `${p.product_type} · ${p.status}`
    })))
  }

  if (type === 'customer') {
    const { data } = await sb.from('customers')
      .select('id, first_name, last_name, postcode, email')
      .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,postcode.ilike.%${q}%`)
      .limit(10)
    return NextResponse.json((data || []).map((c: any) => ({
      id: `CUST-${c.id}`,
      ref: `CUST-${c.id}`,
      type: 'customer',
      name: `${c.first_name} ${c.last_name}`,
      status: 'Active',
      detail: `${c.postcode || ''} · ${c.email || ''}`
    })))
  }

  if (type === 'claim') {
    const { data } = await sb.from('claims')
      .select('id, claim_reference, status, incident_type, customer_id, customers(first_name, last_name)')
      .or(`claim_reference.ilike.%${q}%`)
      .limit(10)
    return NextResponse.json((data || []).map((c: any) => ({
      id: c.claim_reference,
      ref: c.claim_reference,
      type: 'claim',
      name: c.customers ? `${c.customers.first_name} ${c.customers.last_name}` : 'Unknown',
      status: c.status,
      detail: `${c.incident_type || ''} · ${c.status}`
    })))
  }

  return NextResponse.json([])
}
