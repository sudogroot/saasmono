'use client'

import { DashboardLayout } from '@repo/ui'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
