import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('q') || ''
  const category = searchParams.get('cat') || ''

  let query = supabase.from('templates').select('*')
  if (search) query = query.ilike('name', `%${search}%`)
  if (category && category !== 'All') query = query.eq('category', category)

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { data, error } = await supabase.from('templates').insert(body).select()
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data[0])
}