'use client'

import { LatePassTicketsTable } from '@/components/late-pass-tickets/late-pass-tickets-table'
import { useRouter } from 'next/navigation'

export default function LatePassTicketsPage() {
  const router = useRouter()

  const handleGenerateNew = () => {
    router.push('/dashboard/late-pass-tickets/generate')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">تذاكر الدخول</h1>
        <p className="text-muted-foreground mt-2">إدارة تذاكر الدخول للطلاب المتغيبين</p>
      </div>

      <LatePassTicketsTable onGenerateNew={handleGenerateNew} />
    </div>
  )
}
