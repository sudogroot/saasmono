'use client'

import { Header, GenericSidebar, DashboardLayout } from '@repo/ui'
import {
  dashboardSidebarSections,
  dashboardNotifications,
  dashboardUser,
  dashboardQuickActions
} from '@/config/dashboard'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout
      sidebar={{
        component: GenericSidebar,
        props: {
          sections: dashboardSidebarSections,
          header: {
            logo: {
              src: '/logo.svg',
              alt: 'منارة',
              width: 32,
              height: 32,
            },
            title: 'منارة',
            subtitle: 'نظام إدارة المدارس',
          },
          footer: {
            version: 'نسخة ٢.١.٠',
            copyright: '© ٢٠٢٤ منصة منارة',
          },
          side: 'right',
          defaultOpenMenus: ['القائمة الرئيسية'],
        },
      }}
      header={{
        component: Header,
        props: {
          title: 'لوحة التحكم',
          subtitle: 'إدارة شؤون المدرسة',
          notifications: dashboardNotifications,
          user: dashboardUser,
          quickActions: dashboardQuickActions,
          showSearch: true,
          searchPlaceholder: 'البحث...',
          onNotificationClick: (notification: any) => {
            console.log('Notification clicked:', notification)
          },
          onMarkAllAsRead: () => {
            console.log('Mark all as read')
          },
          onUserMenuClick: (action: string) => {
            console.log('User menu action:', action)
          },
        },
      }}
    >
      {children}
    </DashboardLayout>
  )
}
