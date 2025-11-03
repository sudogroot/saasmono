'use client'

import { LatestCasesEnhanced } from '@/components/dashboard/latest-cases-enhanced'
import { LatestClientsEnhanced } from '@/components/dashboard/latest-clients-enhanced'
import { TrialsSectionEnhanced } from '@/components/dashboard/trials-section-enhanced'
import { orpc } from '@/utils/orpc'
import { Text, Button } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Loader2, CalendarDays, Scale, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()

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
    <div className="min-h-screen space-y-4 p-3 sm:space-y-6 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">لوحة التحكم</h1>
        <Text variant="muted" size="sm" className="text-xs sm:text-sm">
          نظرة عامة على نشاطك القانوني
        </Text>
      </div>

      {/* Stats Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 lg:gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg border p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-[10px] font-medium sm:text-xs">إجمالي القضايا</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl lg:text-3xl">{dashboardData.stats.totalCases}</p>
              <p className="text-muted-foreground mt-0.5 text-[10px] sm:text-xs">
                {dashboardData.stats.activeCases} نشطة
              </p>
            </div>
            <Scale className="text-blue-600 dark:text-blue-400 h-8 w-8 sm:h-10 sm:w-10" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg border p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-[10px] font-medium sm:text-xs">إجمالي المنوبين</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl lg:text-3xl">{dashboardData.stats.totalClients}</p>
            </div>
            <Users className="text-purple-600 dark:text-purple-400 h-8 w-8 sm:h-10 sm:w-10" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 rounded-lg border p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-[10px] font-medium sm:text-xs">جلسات هذا الشهر</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl lg:text-3xl">{dashboardData.stats.totalTrialsThisMonth}</p>
            </div>
            <CalendarDays className="text-amber-600 dark:text-amber-400 h-8 w-8 sm:h-10 sm:w-10" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg border p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-[10px] font-medium sm:text-xs">جلسات قادمة</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl lg:text-3xl">{dashboardData.stats.upcomingTrials}</p>
            </div>
            <CalendarDays className="text-green-600 dark:text-green-400 h-8 w-8 sm:h-10 sm:w-10" />
          </div>
        </div>
      </div>

      {/* Today & Tomorrow Trials - Side by Side on Desktop */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
        <TrialsSectionEnhanced
          title="جلسات اليوم"
          trials={dashboardData.todayTrials}
          emptyMessage="لا توجد جلسات اليوم"
          variant="today"
          onViewAll={() => router.push('/dashboard/trials')}
        />
        <TrialsSectionEnhanced
          title="جلسات الغد"
          trials={dashboardData.tomorrowTrials}
          emptyMessage="لا توجد جلسات مجدولة للغد"
          variant="tomorrow"
          onViewAll={() => router.push('/dashboard/trials')}
        />
      </div>

      {/* New Trials & Past Trials - Side by Side on Desktop */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
        {dashboardData.newTrials.length > 0 && (
          <TrialsSectionEnhanced
            title="جلسات جديدة"
            trials={dashboardData.newTrials}
            emptyMessage="لا توجد جلسات جديدة"
            variant="today"
            onViewAll={() => router.push('/dashboard/trials')}
          />
        )}
        {dashboardData.recentTrials.length > 0 && (
          <TrialsSectionEnhanced
            title="الجلسات السابقة"
            trials={dashboardData.recentTrials}
            emptyMessage="لا توجد جلسات سابقة"
            variant="past"
            onViewAll={() => router.push('/dashboard/trials')}
          />
        )}
      </div>

      {/* Latest Cases and Clients - Side by Side on Desktop */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
        <LatestCasesEnhanced
          cases={dashboardData.latestCases}
          onViewAll={() => router.push('/dashboard/cases')}
        />
        <LatestClientsEnhanced
          clients={dashboardData.latestClients}
          onViewAll={() => router.push('/dashboard/clients')}
        />
      </div>
    </div>
  )
}
