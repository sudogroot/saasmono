'use client'

import {
  dashboardNotifications,
  dashboardQuickActions,
  dashboardSidebarSections,
  dashboardMobileNavItems,
  dashboardMobileQuickActions,
  dashboardMobileDrawerItems
} from '@/config/dashboard'

import { useSessionStorage } from '@/hooks/use-session-storage'
import { authClient } from '@/lib/auth-client'
import { DashboardLayout, GenericSidebar, Header, MobileNav } from '@repo/ui'
import { useRouter } from 'next/navigation'

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const { data, isPending, clearStoredData } = useSessionStorage()

  const handleMobileQuickAction = (action: string) => {
    switch (action) {
      case 'add-student':
        router.push('/dashboard/students/new' as any)
        break
      case 'new-report':
        router.push('/dashboard/reports/new' as any)
        break
      case 'search':
        // TODO: Implement search functionality
        console.log('Search action')
        break
      case 'settings':
        router.push('/dashboard/settings' as any)
        break
      default:
        break
    }
  }

  const handleMobileLogout = async () => {
    clearStoredData()
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/')
        },
      },
    })
  }

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
          showSearch: false,
          // searchPlaceholder: 'البحث...',
          // onNotificationClick: (notification: any) => {
          //   console.log('Notification clicked:', notification)
          // },
          // onMarkAllAsRead: () => {
          //   console.log('Mark all as read')
          // },
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

      {/* Mobile Navigation */}
      <MobileNav
        mainNavItems={dashboardMobileNavItems}
        quickActions={dashboardMobileQuickActions}
        drawerItems={dashboardMobileDrawerItems}
        basePath="/dashboard"
        onQuickAction={handleMobileQuickAction}
        onLogout={handleMobileLogout}
        notifications={{
          count: dashboardNotifications.filter(n => !n.isRead).length,
          variant: "destructive"
        }}
      />
    </DashboardLayout>
  )
}
