'use client'

import { Card } from '@repo/ui'
import { SessionNotesTable } from '@/components/sessionNotes/session-notes-table'
import { useRouter } from 'next/navigation'

export default function SessionNotesPage() {
  const router = useRouter()

  const handleCreateNew = () => {
    router.push('/dashboard/session-notes/new')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">كراس القسم</h1>
      </div>

      <Card className="p-6">
        <SessionNotesTable onCreateNew={handleCreateNew} />
      </Card>
    </div>
  )
}
