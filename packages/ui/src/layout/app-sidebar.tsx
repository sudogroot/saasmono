"use client";

import { ReactNode, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar,
} from "../components/ui/sidebar";
import { cn } from "../lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SidebarSubItem {
  title: string;
  url: string;
}

export interface SidebarItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  url?: string;
  description?: string;
  items?: SidebarSubItem[];
}

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export interface SidebarHeaderConfig {
  logo?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  title?: string;
  subtitle?: string;
  component?: ReactNode;
}

export interface SidebarFooterConfig {
  version?: string;
  copyright?: string;
  component?: ReactNode;
}

export interface AppSidebarProps {
  sections: SidebarSection[];
  header?: SidebarHeaderConfig;
  footer?: SidebarFooterConfig;
  side?: "left" | "right";
  className?: string;
  defaultOpenMenus?: string[];
}

export function AppSidebar({
  sections,
  header,
  footer,
  side = "right",
  className,
  defaultOpenMenus = [],
}: AppSidebarProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const [openMenus, setOpenMenus] = useState<string[]>(defaultOpenMenus);

  const toggleMenu = (menuTitle: string) => {
    setOpenMenus((prev) =>
      prev.includes(menuTitle)
        ? prev.filter((title) => title !== menuTitle)
        : [...prev, menuTitle],
    );
  };

  const isActiveUrl = (url: string) => {
    if (url === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(url);
  };

  const hasActiveChild = (items?: SidebarSubItem[]) => {
    if (!items) return false;
    return items.some((item) => isActiveUrl(item.url));
  };

  return (
    <Sidebar
      side={side}
      className={cn(
        "overflow-x-hidden",
        side === "right"
          ? "border-l border-gray-200 dark:border-gray-800"
          : "border-r border-gray-200 dark:border-gray-800",
        className,
      )}
    >
      {/* Header */}
      {header && (
        <SidebarHeader className="border-b border-gray-200 py-4 dark:border-gray-800">
          {header.component ? (
            header.component
          ) : (
            <div className="flex items-center gap-3">
              {header.logo && (
                <img
                  src={header.logo.src}
                  alt={header.logo.alt}
                  width={header.logo.width || 32}
                  height={header.logo.height || 32}
                  className="h-8 w-8"
                />
              )}
              {(header.title || header.subtitle) && (
                <div
                  className={cn(
                    "flex flex-col text-right",
                    state === "collapsed" && "hidden",
                  )}
                >
                  {header.title && (
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {header.title}
                    </span>
                  )}
                  {header.subtitle && (
                    <span className="text-xs text-gray-500">
                      {header.subtitle}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </SidebarHeader>
      )}

      <SidebarContent className="flex h-full flex-col overflow-x-hidden">
        {sections.map((section, sectionIndex) => (
          <div key={section.title}>
            <SidebarGroup>
              <SidebarGroupLabel className="mb-2 text-right">
                {section.title}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      {item.items ? (
                        // Collapsible menu item
                        <>
                          <SidebarMenuButton
                            onClick={() => toggleMenu(item.title)}
                            className={cn(
                              "w-full min-w-0 justify-between text-right",
                              hasActiveChild(item.items) &&
                                "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
                            )}
                            tooltip={
                              state === "collapsed" ? item.title : undefined
                            }
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span
                                className={cn(
                                  "truncate",
                                  state === "collapsed" ? "sr-only" : "block",
                                )}
                              >
                                {item.title}
                              </span>
                              <item.icon className="h-5 w-5 flex-shrink-0" />
                            </div>
                            {state !== "collapsed" &&
                              (openMenus.includes(item.title) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              ))}
                          </SidebarMenuButton>

                          {openMenus.includes(item.title) &&
                            state !== "collapsed" && (
                              <SidebarMenuSub>
                                {item.items.map((subItem) => (
                                  <SidebarMenuSubItem key={subItem.url}>
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={isActiveUrl(subItem.url)}
                                      className="text-right"
                                    >
                                      <Link href={subItem.url}>
                                        <span className="truncate">
                                          {subItem.title}
                                        </span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            )}
                        </>
                      ) : (
                        // Simple menu item
                        <SidebarMenuButton
                          asChild
                          isActive={isActiveUrl(item.url!)}
                          tooltip={
                            state === "collapsed" ? item.title : undefined
                          }
                          className="min-w-0 text-right"
                        >
                          <Link
                            href={item.url!}
                            className="flex min-w-0 items-center gap-3"
                          >
                            <span
                              className={cn(
                                "truncate",
                                state === "collapsed" ? "sr-only" : "block",
                              )}
                            >
                              {item.title}
                            </span>
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                          </Link>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {sectionIndex < sections.length - 1 && <SidebarSeparator />}
          </div>
        ))}
      </SidebarContent>

      {/* Footer */}
      {footer && (
        <SidebarFooter className="border-t border-gray-200 p-4 dark:border-gray-800">
          {footer.component ? (
            footer.component
          ) : (
            <div
              className={cn("text-center", state === "collapsed" && "hidden")}
            >
              {footer.version && (
                <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                  {footer.version}
                </div>
              )}
              {footer.copyright && (
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {footer.copyright}
                </div>
              )}
            </div>
          )}
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
