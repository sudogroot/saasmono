import { usePathname } from "next/navigation";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "./site-header";

// Export the new generic components
export { SiteHeader as Header } from "./site-header";
export { AppSidebar } from "./app-sidebar";
export { MobileNav } from "./mobile-nav";

// Export Raqeem-specific components
export { RaqeemDashboardLayout } from "./raqeem-dashboard-layout";
export { RaqeemDashboardSidebar } from "./raqeem-sidebar";
export { RaqeemNavbar } from "./raqeem-navbar";
export { RaqeemMainContainer } from "./raqeem-main-container";
export { RaqeemSidebarLayout } from "./raqeem-sidebar-layout";

// Export navigation components
export { NavMain } from "./nav-main";
export { NavDocuments } from "./nav-documents";
export { NavSecondary } from "./nav-secondary";
export { NavUser } from "./nav-user";

export type { HeaderProps } from "./site-header";
export type { AppSidebarProps } from "./app-sidebar";
export type {
  MobileNavProps,
  MobileNavItem,
  DrawerCategory,
  NotificationInfo,
  QuickAction as MobileQuickAction,
} from "./mobile-nav";
export type { RaqeemDashboardLayoutProps } from "./raqeem-dashboard-layout";
export type {
  NavigationItem,
  RaqeemDashboardSidebarProps,
} from "./raqeem-sidebar";
export type { RaqeemNavbarProps } from "./raqeem-navbar";

export interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarData?: any;
  brandLogo: React.ReactNode;
  brandIcon: React.ReactNode;
  brandName?: string;
  headerTitle?: string;
  style?: React.CSSProperties;
}

export function DashboardLayout({
  children,
  sidebarData,
  brandLogo,
  brandIcon,
  brandName,
  style,
}: DashboardLayoutProps) {
  const defaultStyle = {
    "--sidebar-width": "calc(var(--spacing) * 72)",
    "--header-height": "calc(var(--spacing) * 12)",
  } as React.CSSProperties;
  const pathName = usePathname();

  // Get header title from sidebar data based on pathname
  const getHeaderTitleFromPath = (pathname: string, sidebarData: any) => {
    // Check navMain items
    if (sidebarData.navMain) {
      const mainItem = sidebarData.navMain.find(
        (item: any) => item.url === pathname,
      );
      if (mainItem) return mainItem.title;
    }

    // Check navSecondary items
    if (sidebarData.navSecondary) {
      const secondaryItem = sidebarData.navSecondary.find(
        (item: any) => item.url === pathname,
      );
      if (secondaryItem) return secondaryItem.title;
    }

    // Check documents items
    if (sidebarData.documents) {
      const documentItem = sidebarData.documents.find(
        (item: any) => item.url === pathname,
      );
      if (documentItem) return documentItem.name;
    }
  };

  const dynamicHeaderTitle = getHeaderTitleFromPath(pathName, sidebarData);

  return (
    <SidebarProvider
      style={style ? { ...defaultStyle, ...style } : defaultStyle}
    >
      <AppSidebar
        variant="inset"
        data={sidebarData}
        brandLogo={brandLogo}
        brandIcon={brandIcon}
        brandName={brandName}
      />
      <SidebarInset
        className="md:peer-data-[variant=inset]:m-2
      md:peer-data-[variant=inset]:ms-0
      md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ms-2
"
      >
        <SiteHeader title={dynamicHeaderTitle} />
        <div className="flex flex-1 flex-col p-2">
          <div className=" flex flex-1 flex-col gap-2">
            <div className="flex flex-col h-full gap-4 py-4 md:gap-6 md:py-2 text-base">
              <div>{children}</div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
