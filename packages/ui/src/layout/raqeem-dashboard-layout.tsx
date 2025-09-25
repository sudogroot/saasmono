"use client"

import { RaqeemDashboardSidebar } from "./raqeem-sidebar"
import type { NavigationItem } from "./raqeem-sidebar"
import { RaqeemNavbar } from "./raqeem-navbar"
import { RaqeemSidebarLayout } from "./raqeem-sidebar-layout"
import { MobileNav } from "./mobile-nav"
import { RaqeemMainContainer } from "./raqeem-main-container"

export interface RaqeemDashboardLayoutProps {
  children: React.ReactNode;
  navigationItems: NavigationItem[];
  breadcrumbs: Record<string, string>;
  pathname: string;
  user?: {
    name?: string;
    email?: string;
    image?: string;
  };
  onSignOut?: () => void;
  onNewClient?: () => void;
  onNewCase?: () => void;
  onNewOpponent?: () => void;
  onSearch?: () => void;
  mobileNavItems?: any[];
  mobileQuickActions?: any[];
  mobileDrawerItems?: any[];
  onMobileQuickAction?: (action: string) => void;
  onMobileLogout?: () => void;
  mobileNotifications?: any;
  useSheetUrlSync?: () => void;
}

export function RaqeemDashboardLayout({
  children,
  navigationItems,
  breadcrumbs,
  pathname,
  user,
  onSignOut,
  onNewClient,
  onNewCase,
  onNewOpponent,
  onSearch,
  mobileNavItems = [],
  mobileQuickActions = [],
  mobileDrawerItems = [],
  onMobileQuickAction,
  onMobileLogout,
  mobileNotifications,
  useSheetUrlSync
}: RaqeemDashboardLayoutProps) {
  // Initialize sheets from URL parameters if hook is provided
  if (useSheetUrlSync) {
    useSheetUrlSync();
  }

  return (
    <>
      <RaqeemSidebarLayout
        navbar={
          <RaqeemNavbar
            breadcrumbs={breadcrumbs}
            pathname={pathname}
          />
        }
        sidebar={({ isCollapsed }) => (
          <RaqeemDashboardSidebar
            isCollapsed={isCollapsed}
            navigationItems={navigationItems}
            user={user}
            onSignOut={onSignOut}
            onNewClient={onNewClient}
            onNewCase={onNewCase}
            onNewOpponent={onNewOpponent}
            onSearch={onSearch}
          />
        )}
      >
        <RaqeemMainContainer
          breadcrumbs={breadcrumbs}
          pathname={pathname}
        >
          {children}
        </RaqeemMainContainer>
      </RaqeemSidebarLayout>

      {/* Mobile Bottom Navigation */}
      {mobileNavItems.length > 0 && (
        <MobileNav
          mainNavItems={mobileNavItems}
          quickActions={mobileQuickActions}
          drawerItems={mobileDrawerItems}
          basePath="/dashboard"
          onQuickAction={onMobileQuickAction}
          onLogout={onMobileLogout}
          notifications={mobileNotifications}
        />
      )}
    </>
  )
}