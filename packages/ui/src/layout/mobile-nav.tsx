"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../components/ui/drawer";
import { MoreHorizontal, X } from "lucide-react";
import { cn } from "../lib/utils";

export interface MobileNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

export interface QuickAction {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  action: string;
  color: string;
}

export interface DrawerCategory {
  category: string;
  items: Array<{
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }>;
}

export interface NotificationInfo {
  count?: number;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export interface MobileNavProps {
  /**
   * Main navigation items shown in the bottom bar
   */
  mainNavItems: MobileNavItem[];

  /**
   * Quick actions shown in the drawer
   */
  quickActions?: QuickAction[];

  /**
   * Drawer categories and items
   */
  drawerItems?: DrawerCategory[];

  /**
   * Base path prefix (e.g., '/dashboard')
   */
  basePath?: string;

  /**
   * Function to check if a route is active
   */
  isActiveRoute?: (href: string, pathname: string) => boolean;

  /**
   * Handler for quick actions
   */
  onQuickAction?: (action: string) => void;

  /**
   * Notification info
   */
  notifications?: NotificationInfo;

  /**
   * Logout handler
   */
  onLogout?: () => void;

  /**
   * Custom footer actions
   */
  footerActions?: React.ReactNode;

  /**
   * Custom drawer content
   */
  customDrawerContent?: React.ReactNode;

  /**
   * More button text
   */
  moreButtonText?: string;

  /**
   * Drawer title and description
   */
  drawerTitle?: string;
  drawerDescription?: string;

  /**
   * Quick actions section title
   */
  quickActionsTitle?: string;
}

export function MobileNav({
  mainNavItems,
  quickActions = [],
  drawerItems = [],
  basePath = "",
  isActiveRoute,
  onQuickAction,
  notifications,
  onLogout,
  footerActions,
  customDrawerContent,
  moreButtonText = "المزيد",
  drawerTitle = "القائمة الرئيسية",
  drawerDescription = "الوصول السريع لجميع الميزات والإعدادات",
  quickActionsTitle = "إجراءات سريعة",
}: MobileNavProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  const defaultIsActive = (href: string) => {
    const fullPath = href ? `${basePath}/${href}` : basePath;

    if (href === "") {
      return pathname === basePath;
    }
    return pathname.startsWith(fullPath);
  };

  const checkIsActive = isActiveRoute || defaultIsActive;

  const handleQuickAction = (action: string) => {
    setDrawerOpen(false);
    onQuickAction?.(action);
  };

  const handleNavigation = (href: string) => {
    // Navigation is handled by Link components in the implementation
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 lg:hidden">
        <div className={`grid h-16 ${mainNavItems.length >= 5 ? 'grid-cols-5' : `grid-cols-${mainNavItems.length + 1}`}`}>
          {/* Main Navigation Items */}
          {mainNavItems.map((item) => {
            const active = checkIsActive(item.href, pathname);
            const ItemComponent = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
              <a
                {...props}
                href={item.href ? `${basePath}/${item.href}` : basePath}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-1 transition-colors relative",
                  active
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {children}
              </a>
            );

            return (
              <ItemComponent key={item.href}>
                <div className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  active ? item.bgColor : "hover:bg-gray-100"
                )}>
                  <item.icon className={cn(
                    "h-5 w-5",
                    active ? item.color : "text-current"
                  )} />
                </div>
                <span className="text-xs font-medium mt-0.5 leading-none">
                  {item.title}
                </span>
                {active && (
                  <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full"></div>
                )}
              </ItemComponent>
            );
          })}

          {/* More Button with Drawer */}
          {(quickActions.length > 0 || drawerItems.length > 0 || customDrawerContent) && (
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger asChild>
                <button className="flex flex-col items-center justify-center py-2 px-1 text-gray-500 hover:text-gray-700 transition-colors">
                  <div className="p-1.5 rounded-lg hover:bg-gray-100">
                    <MoreHorizontal className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium mt-0.5 leading-none">{moreButtonText}</span>
                </button>
              </DrawerTrigger>

              <DrawerContent className="max-h-[85vh]" dir="rtl">
                <DrawerHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <DrawerTitle>{drawerTitle}</DrawerTitle>
                      <DrawerDescription>
                        {drawerDescription}
                      </DrawerDescription>
                    </div>
                    <DrawerClose asChild>
                      <Button variant="ghost" size="sm">
                        <X className="h-4 w-4" />
                      </Button>
                    </DrawerClose>
                  </div>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {customDrawerContent || (
                    <>
                      {/* Quick Actions */}
                      {quickActions.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-3">{quickActionsTitle}</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {quickActions.map((action) => (
                              <Button
                                key={action.action}
                                variant="ghost"
                                className={cn(
                                  "h-auto p-4 justify-start gap-3",
                                  action.color
                                )}
                                onClick={() => handleQuickAction(action.action)}
                              >
                                <action.icon className="h-5 w-5" />
                                <span className="font-medium">{action.title}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Navigation Categories */}
                      {drawerItems.map((category) => (
                        <div key={category.category}>
                          <h3 className="text-sm font-semibold text-gray-900 mb-3">
                            {category.category}
                          </h3>
                          <div className="space-y-2">
                            {category.items.map((item) => {
                              const active = checkIsActive(item.href, pathname);
                              return (
                                <a
                                  key={item.href}
                                  href={item.href ? `${basePath}/${item.href}` : basePath}
                                  onClick={() => handleNavigation(item.href)}
                                  className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg transition-colors",
                                    active
                                      ? "bg-primary/10 text-primary"
                                      : "hover:bg-gray-50 text-gray-700"
                                  )}
                                >
                                  <div className={cn(
                                    "p-2 rounded-lg",
                                    active ? "bg-primary/20" : "bg-gray-100"
                                  )}>
                                    <item.icon className={cn(
                                      "h-4 w-4",
                                      active ? "text-primary" : "text-gray-600"
                                    )} />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium">{item.title}</div>
                                    <div className="text-xs text-gray-500 leading-tight">
                                      {item.description}
                                    </div>
                                  </div>
                                  {active && (
                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                  )}
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {(footerActions || notifications || onLogout) && (
                  <DrawerFooter className="border-t">
                    {footerActions || (
                      <div className="flex items-center justify-between">
                        {notifications && (
                          <Button variant="outline" size="sm">
                            {/* Bell icon would be passed via quickActions or custom implementation */}
                            التنبيهات
                            {notifications.count && notifications.count > 0 && (
                              <Badge variant={notifications.variant || "destructive"} className="mr-2">
                                {notifications.count}
                              </Badge>
                            )}
                          </Button>
                        )}
                        {onLogout && (
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={onLogout}>
                            {/* LogOut icon would be passed via custom implementation */}
                            تسجيل الخروج
                          </Button>
                        )}
                      </div>
                    )}
                  </DrawerFooter>
                )}
              </DrawerContent>
            </Drawer>
          )}
        </div>
      </div>

      {/* Bottom padding for content to avoid bottom nav overlap */}
      <div className="h-16 lg:hidden" />
    </>
  );
}