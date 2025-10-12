'use client'

import { Card, CardContent, CardHeader, CardTitle, Text } from '@repo/ui'
import { Briefcase, Calendar, FileText, Scale, Users } from 'lucide-react'

interface StatsCardsProps {
  stats: {
    totalCases: number
    activeCases: number
    totalClients: number
    totalTrialsThisMonth: number
    upcomingTrials: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'إجمالي القضايا',
      value: stats.totalCases,
      icon: Briefcase,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'القضايا النشطة',
      value: stats.activeCases,
      icon: FileText,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'إجمالي العملاء',
      value: stats.totalClients,
      icon: Users,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'جلسات هذا الشهر',
      value: stats.totalTrialsThisMonth,
      icon: Calendar,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'الجلسات القادمة',
      value: stats.upcomingTrials,
      icon: Scale,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`rounded-full p-2 ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
