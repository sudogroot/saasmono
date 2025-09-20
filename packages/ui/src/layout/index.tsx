import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "./site-header";

// Export the new generic components
export { SiteHeader as Header } from "./site-header";
export { AppSidebar as GenericSidebar } from "./app-sidebar";
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

export function DashboardLayout({
  children,
  sidebar,
  header,
  style,
}: DashboardLayoutProps) {
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

  // Default props for SiteHeader
  const defaultHeaderProps = {
    // title: "Dashboard",
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
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
