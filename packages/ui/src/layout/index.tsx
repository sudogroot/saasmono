import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "./site-header";
import { usePathname } from "next/navigation";

// Export the new generic components
export { SiteHeader as Header } from "./site-header";
export { AppSidebar as GenericSidebar } from "./app-sidebar";
export { MobileNav } from "./mobile-nav";

// Export Raqeem-specific components
export { RaqeemDashboardLayout } from "./raqeem-dashboard-layout";
export { RaqeemDashboardSidebar } from "./raqeem-sidebar";
export { RaqeemNavbar } from "./raqeem-navbar";
export { RaqeemMainContainer } from "./raqeem-main-container";
export { RaqeemSidebarLayout } from "./raqeem-sidebar-layout";

export type {
  HeaderProps,
  Notification,
  UserInfo,
  QuickAction,
} from "./site-header";
export type {
  AppSidebarProps,
  SidebarItem,
  SidebarSection,
  SidebarHeaderConfig,
  SidebarFooterConfig,
  SidebarSubItem,
} from "./app-sidebar";
export type {
  MobileNavProps,
  MobileNavItem,
  DrawerCategory,
  NotificationInfo,
  QuickAction as MobileQuickAction,
} from "./mobile-nav";
export type {
  RaqeemDashboardLayoutProps,
} from "./raqeem-dashboard-layout";
export type {
  NavigationItem,
  RaqeemDashboardSidebarProps,
} from "./raqeem-sidebar";
export type {
  RaqeemNavbarProps,
} from "./raqeem-navbar";

export interface SidebarConfig {
  component?: React.ComponentType<any>;
  props?: any;
}

export interface HeaderConfig {
  component?: React.ComponentType<any>;
  props?: any;
}

export interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar?: SidebarConfig;
  header?: HeaderConfig;
  style?: React.CSSProperties;
}

function getActiveSidebarItemTitle(
  pathname: string,
  sections: any[],
): string | undefined {
  for (const section of sections) {
    for (const item of section.items || []) {
      if (item.url === pathname) {
        return item.title;
      }
      // Check sub-items if they exist
      if (item.items) {
        for (const subItem of item.items) {
          if (subItem.url === pathname) {
            return subItem.title;
          }
        }
      }
    }
  }
  return undefined;
}

export function DashboardLayout({
  children,
  sidebar,
  header,
  style,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const SidebarComponent = sidebar?.component || AppSidebar;
  const HeaderComponent = header?.component || SiteHeader;

  const defaultStyle = {
    "--sidebar-width": "calc(var(--spacing) * 72)",
    "--header-height": "calc(var(--spacing) * 12)",
  } as React.CSSProperties;

  // Default props for AppSidebar
  const defaultSidebarProps = {
    sections: [],
    ...sidebar?.props,
  };

  // Get active sidebar item title
  const activeSidebarTitle = getActiveSidebarItemTitle(
    pathname,
    sidebar?.props?.sections || [],
  );

  // Default props for SiteHeader
  const defaultHeaderProps = {
    title: activeSidebarTitle,
    ...header?.props,
  };

  return (
    <SidebarProvider
      style={style ? { ...defaultStyle, ...style } : defaultStyle}
    >
      <SidebarComponent variant="inset" {...defaultSidebarProps} />
      <SidebarInset>
        <HeaderComponent {...defaultHeaderProps} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col sm:gap-4 gap-0 sm:py-4 py-0 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
