import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('q') || ''
  const tag = searchParams.get('cat') || ''

  let query = supabase.from('templates').select('*')
  if (search) query = query.ilike('name', `%${search}%`)
  if (tag && tag !== 'All') query = query.contains('tags', [tag])

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  // Ensure tags is always an array
  if (!body.tags || !Array.isArray(body.tags)) {
    body.tags = body.category ? [body.category] : []
  }
  const { data, error } = await supabase.from('templates').insert(body).select()
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data[0])
}

export async function PATCH(req: Request) {
  const { id, ...updates } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  // Keep tags in sync with category if tags not explicitly provided
  if (updates.category && (!updates.tags || !updates.tags.length)) {
    updates.tags = [updates.category]
  }
  const { data, error } = await supabase
    .from('templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}
