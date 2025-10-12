'use client'

import { CasesTable } from '@/components/cases/cases-table'
import { globalSheet } from '@/stores/global-sheet-store'

export default function CasesPage() {
  const handleCreateNew = () => {
    globalSheet.openCaseForm({
      mode: 'create',
      slug: 'cases',
      size: 'md',
    })
  }

  return (
    <div className="space-y-6">
      <CasesTable onCreateNew={handleCreateNew} />
    </div>
  )
}
