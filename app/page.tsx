'use client'

import dynamic from 'next/dynamic'

const DocPro = dynamic(() => import('@/components/DocPro'), { ssr: false })

export default function Home() {
  return <DocPro />
}
