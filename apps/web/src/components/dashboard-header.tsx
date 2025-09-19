'use client'

import {
  SidebarTrigger,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@repo/ui'
import {
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  HelpCircle,
  MessageSquare,
  Calendar,
  ChevronDown,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import { cn } from '@repo/ui/lib/utils'

export function DashboardHeader() {
  const { theme, setTheme } = useTheme()
  const [notifications] = useState([
    { id: 1, title: 'طالب جديد تم تسجيله', time: 'منذ ٥ دقائق', unread: true },
    { id: 2, title: 'تحديث في جدول الحصص', time: 'منذ ١٥ دقيقة', unread: true },
    { id: 3, title: 'تقرير الحضور الأسبوعي جاهز', time: 'منذ ٣٠ دقيقة', unread: false },
  ])

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-gray-950/80 dark:border-gray-800">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left side - Sidebar trigger and breadcrumbs */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100" />

          <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>لوحة التحكم</span>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100">الرئيسية</span>
          </div>
        </div>

        {/* Right side - Search, notifications, and user menu */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث..."
                className="w-64 h-9 pr-10 pl-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white text-right"
                dir="rtl"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
              <Calendar className="h-4 w-4 ml-2" />
              <span>التقويم</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
              <MessageSquare className="h-4 w-4 ml-2" />
              <span>الرسائل</span>
            </Button>
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">تبديل المظهر</span>
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -left-1 h-5 w-5 text-xs bg-red-500 text-white border-0 p-0 flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
                <span className="sr-only">الإشعارات</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80" dir="rtl">
              <DropdownMenuLabel className="text-right">
                الإشعارات ({unreadCount} غير مقروءة)
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={cn(
                      "flex flex-col items-start p-3 text-right cursor-pointer",
                      notification.unread && "bg-blue-50 dark:bg-blue-950"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs text-gray-500">{notification.time}</span>
                      {notification.unread && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                      {notification.title}
                    </span>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center text-blue-600 hover:text-blue-800 cursor-pointer">
                عرض جميع الإشعارات
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 gap-2 px-3 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                <ChevronDown className="h-4 w-4" />
                <div className="flex flex-col text-right text-xs leading-tight">
                  <span className="font-medium">أحمد محمد</span>
                  <span className="text-gray-500">مدير المدرسة</span>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/01.png" alt="أحمد محمد" />
                  <AvatarFallback>أم</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" dir="rtl">
              <DropdownMenuLabel className="text-right">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">أحمد محمد السليماني</p>
                  <p className="text-xs text-gray-500">ahmed.mohamed@school.tn</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-right cursor-pointer">
                <User className="ml-2 h-4 w-4" />
                <span>الملف الشخصي</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-right cursor-pointer">
                <Settings className="ml-2 h-4 w-4" />
                <span>الإعدادات</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-right cursor-pointer">
                <HelpCircle className="ml-2 h-4 w-4" />
                <span>المساعدة والدعم</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-right cursor-pointer text-red-600 focus:text-red-600">
                <LogOut className="ml-2 h-4 w-4" />
                <span>تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>

      {/* Mobile search bar */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="البحث..."
            className="w-full h-9 pr-10 pl-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white text-right"
            dir="rtl"
          />
        </div>
      </div>
    </header>
  )
}