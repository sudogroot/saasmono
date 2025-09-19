'use client'

import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import {
  SidebarProvider,
  SidebarInset,
} from '@repo/ui'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950" dir="rtl">
      <SidebarProvider defaultOpen={true}>
        <DashboardSidebar />
        <SidebarInset>
          <DashboardHeader />
          <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}