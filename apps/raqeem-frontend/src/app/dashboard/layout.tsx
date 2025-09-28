'use client'

import { drawerItems, mainNavItems, quickActions } from '@/components/layout/config'
import { raqeemDashboardSidebarData } from '@/config/dashboard-sidebar'
import { useSheetUrlSync } from '@/hooks/use-sheet-url-sync'
import { authClient } from '@/lib/auth-client'
import { globalSheet } from '@/stores/global-sheet-store'
import { DashboardLayout, MobileNav } from '@repo/ui'
import { usePathname, useRouter } from 'next/navigation'

export default function NewLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, isPending } = authClient.useSession()

  // User handling functions
  const handleSignOut = async () => {
    await authClient.signOut()
    window.location.href = '/'
  }

  // Quick action handlers that open forms in side sheets
  const handleNewClient = () => {
    globalSheet.openClientForm({
      mode: 'create',
      slug: 'clients',
      size: 'lg',
    })
  }

  const handleNewCase = () => {
    globalSheet.openCaseForm({
      mode: 'create',
      slug: 'cases',
      size: 'lg',
    })
  }

  const handleNewOpponent = () => {
    globalSheet.openOpponentForm({
      mode: 'create',
      slug: 'opponents',
      size: 'lg',
    })
  }

  const handleSearch = () => {
    // TODO: Implement global search functionality in a sheet
    console.log('Global search functionality coming soon...')
  }

  const handleMobileQuickAction = (action: string) => {
    switch (action) {
      case 'create-case':
        handleNewCase()
        break
      case 'create-client':
        handleNewClient()
        break
      case 'create-appointment':
        // TODO: Add appointment form when available
        console.log('Create appointment action')
        break
      case 'search':
        handleSearch()
        break
      default:
        break
    }
  }

  const handleMobileLogout = async () => {
    await authClient.signOut()
    window.location.href = '/'
  }

  // User data
  const user =
    !isPending && session
      ? {
          name: session.user?.name || '',
          email: session.user?.email || '',
          image: session.user?.image || '',
        }
      : undefined

  // Initialize sheets from URL parameters
  useSheetUrlSync()

  return (
    <DashboardLayout
      sidebarData={{
        ...raqeemDashboardSidebarData,
        user: {
          name: user?.name,
          email: user?.email,
          avatar: user?.image || '/raqeem-icon.svg',
        },
      }}
      brandLogo={<img src="/logo.svg" alt="رقيم" className="!w-24" />}
      brandIcon={<img src="/raqeem-icon.svg" alt="رقيم" className="!w-[34px]" />}
    >
      {children}

      {/* Mobile Navigation */}
      <MobileNav
        mainNavItems={mainNavItems}
        quickActions={quickActions}
        drawerItems={drawerItems}
        basePath="/dashboard"
        onQuickAction={handleMobileQuickAction}
        onLogout={handleMobileLogout}
        notifications={{
          count: 3,
          variant: 'destructive',
        }}
      />
    </DashboardLayout>
  )
}
