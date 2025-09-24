"use client"

import { DashboardSidebar } from "./sidebar"
import { Navbar } from "./navbar"
import { SidebarLayout } from "./sidebar-layout"
import { MobileNav } from "./mobile-nav"
import { MainContainer } from "./main-container"
import { useSheetUrlSync } from "@/hooks/use-sheet-url-sync"

interface DashboardLayoutProps {
  children: React.ReactNode
  breadcrumbs?: {
    label: string
    href?: string
  }[]
}

export function DashboardLayout({
  children,
  breadcrumbs = []
}: DashboardLayoutProps) {
  // Initialize sheets from URL parameters
  useSheetUrlSync();

  return (
    <>
      <SidebarLayout
        navbar={
          <Navbar
          />
        }
        sidebar={({ isCollapsed }) => (
          <DashboardSidebar
            isCollapsed={isCollapsed}
          />
        )}
      >
        <MainContainer>
          {children}
        </MainContainer>
      </SidebarLayout>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Offline Indicator */}
    </>
  )
}
