"use client";

import { ReactNode } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { SidebarTrigger } from "../components/ui/sidebar";
import { Separator } from "../components/ui/separator";
import { Bell, Plus, Search } from "lucide-react";
import { cn } from "../lib/utils";
import { useIsMobile } from "../hooks/use-mobile";

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type?: "info" | "warning" | "error" | "success";
}

export interface UserInfo {
  name: string;
  email: string;
  avatar?: string;
  initials?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  notifications?: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onMarkAllAsRead?: () => void;
  user?: UserInfo;
  onUserMenuClick?: (action: string) => void;
  quickActions?: QuickAction[];
  showSidebarTrigger?: boolean;
  className?: string;
  children?: ReactNode;
}

export function SiteHeader({
  title,
  subtitle,
  showSearch = true,
  searchPlaceholder = "بحث...",
  onSearch,
  notifications = [],
  onNotificationClick,
  onMarkAllAsRead,
  user,
  onUserMenuClick,
  quickActions = [],
  showSidebarTrigger = true,
  className,
  children,
}: HeaderProps) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const isMobile = useIsMobile();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-16 shrink-0 items-center border-b bg-white/80 backdrop-blur-md px-4 shadow-sm transition-all duration-200 ease-in-out",
        "group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12",
        "dark:bg-gray-950/80 dark:border-gray-800",
        isMobile ? "shadow-none static" : "",
        className,
      )}
    >
      <div className="flex w-full items-center justify-between gap-4">
        {/* Right side - Sidebar trigger and title */}
        <div className="flex items-center gap-3">
          {showSidebarTrigger && (
            <SidebarTrigger className="h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" />
          )}
          {showSidebarTrigger && (
            <Separator
              orientation="vertical"
              className="h-5 bg-gray-300 dark:bg-gray-700"
            />
          )}

          {(title || subtitle) && isMobile && (
            <div className="flex flex-col min-w-0">
              {title && (
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Center - Search */}
        {showSearch && (
          <div className="flex-1 max-w-md mx-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300" />
              <Input
                placeholder={searchPlaceholder}
                className="h-9 pl-10 pr-4 text-right bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all dark:bg-gray-800 dark:border-gray-700 dark:focus:bg-gray-900 dark:focus:border-blue-600 dark:focus:ring-blue-900/20"
                onChange={(e) => onSearch?.(e.target.value)}
                dir="rtl"
              />
            </div>
          </div>
        )}

        {/* Left side - Actions and user menu */}
        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          {/*{quickActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "ghost"}
              size="sm"
              onClick={action.onClick}
              className="hidden lg:flex h-9 px-3 gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <action.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          ))}*/}

          {/* Add Button */}
          {/*<Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex h-9 px-3 gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium hidden lg:inline">إضافة</span>
          </Button>*/}

          {/* Notifications */}
          {/*{notifications.length > 0 && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs font-medium animate-pulse"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                  <Bell className="h-4 w-4" />
                  <span className="sr-only">الإشعارات</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-80 shadow-lg border-gray-200 dark:border-gray-700"
              >
                <DropdownMenuLabel className="text-right py-3 px-4 bg-gray-50 dark:bg-gray-800/50 font-semibold">
                  الإشعارات ({unreadCount} غير مقروءة)
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-0" />
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification, index) => (
                    <DropdownMenuItem
                      key={index}
                      className={cn(
                        "cursor-pointer p-4 text-right hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                        !notification.isRead &&
                          "bg-blue-50/50 dark:bg-blue-950/30 border-r-2 border-blue-500",
                      )}
                      onClick={() => onNotificationClick?.(notification)}
                    >
                      <div className="flex w-full flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {notification.time}
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {notification.title}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          {notification.message}
                        </p>
                        {!notification.isRead && (
                          <div className="flex justify-end">
                            <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></div>
                          </div>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
                {unreadCount > 0 && (
                  <>
                    <DropdownMenuSeparator className="my-0" />
                    <DropdownMenuItem
                      className="cursor-pointer text-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-medium py-3 transition-colors"
                      onClick={onMarkAllAsRead}
                    >
                      تمييز الكل كمقروء
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
*/}
          {/* User Menu */}
          {user && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full p-0 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ring-offset-2 focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-gray-800 shadow-sm">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {user.initials || user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 shadow-lg border-gray-200 dark:border-gray-700"
              >
                <DropdownMenuLabel className="text-right py-3 px-4 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-0" />
                <DropdownMenuItem
                  className="cursor-pointer text-right py-2.5 px-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => onUserMenuClick?.("settings")}
                >
                  <span className="font-medium">الإعدادات</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-0" />
                <DropdownMenuItem
                  className="cursor-pointer text-right py-2.5 px-4 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  onClick={() => onUserMenuClick?.("logout")}
                >
                  <span className="font-medium">تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Custom children */}
          {children}
        </div>
      </div>
    </header>
  );
}
