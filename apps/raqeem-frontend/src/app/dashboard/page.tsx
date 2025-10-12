'use client'

import { LatestCases } from '@/components/dashboard/latest-cases'
import { LatestClients } from '@/components/dashboard/latest-clients'
import { TrialsSection } from '@/components/dashboard/trials-section'
import { orpc } from '@/utils/orpc'
import { Text } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Loader2 } from 'lucide-react'

export default function Dashboard() {
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery({
    ...orpc.dashboard.getDashboardData.queryOptions({}),
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>جاري تحميل لوحة التحكم...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-destructive flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>حدث خطأ في تحميل البيانات</span>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="text-muted-foreground flex min-h-[60vh] items-center justify-center">
        <span>لا توجد بيانات</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-3 sm:p-4">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">لوحة التحكم</h1>
        <Text variant="muted" size="sm">
          نظرة عامة على نشاطك القانوني
        </Text>
      </div>

      {/* Trials Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TrialsSection title="جلسات اليوم" trials={dashboardData.todayTrials} emptyMessage="لا توجد جلسات اليوم" />
        <TrialsSection
          title="جلسات الغد"
          trials={dashboardData.tomorrowTrials}
          emptyMessage="لا توجد جلسات مجدولة للغد"
        />
      </div>

      {/* Recent Trials Section */}
      <div>
        <TrialsSection
          title="الجلسات الأخيرة"
          trials={dashboardData.recentTrials}
          emptyMessage="لا توجد جلسات سابقة"
        />
      </div>

      {/* Latest Cases and Clients */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LatestCases cases={dashboardData.latestCases} />
        <LatestClients clients={dashboardData.latestClients} />
      </div>
    </div>
  )
}
