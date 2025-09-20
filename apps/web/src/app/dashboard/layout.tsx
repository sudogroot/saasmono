'use client'

import { dashboardNotifications, dashboardQuickActions, dashboardSidebarSections } from '@/config/dashboard'

import { useSessionStorage } from '@/hooks/use-session-storage'
import { authClient } from '@/lib/auth-client'
import { DashboardLayout, GenericSidebar, Header } from '@repo/ui'
import { useRouter } from 'next/navigation'

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const { data, isPending, clearStoredData } = useSessionStorage()
  console.log(data)
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
          user: !isPending
            ? {
                name: data?.user?.name,
                email: data?.user?.email,
                avatar: data?.user?.image,
                initials: data?.user?.name
                  ?.split(' ')
                  .map((word) => word[0])
                  .join(''),
              }
            : undefined,
          quickActions: dashboardQuickActions,
          showSearch: true,
          searchPlaceholder: 'البحث...',
          onNotificationClick: (notification: any) => {
            console.log('Notification clicked:', notification)
          },
          onMarkAllAsRead: () => {
            console.log('Mark all as read')
          },
          onUserMenuClick: async (action: string) => {
            if (action === 'logout') {
              clearStoredData()
              await authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    router.push('/') // redirect to login page
                  },
                },
              })
            } else if (action === 'settings') {
              router.push('/dashboard/user/settings')
            }
          },
        },
      }}
    >
      {children}
    </DashboardLayout>
  )
}
