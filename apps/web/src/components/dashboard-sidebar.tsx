'use client'

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
} from '@repo/ui'
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  Bell,
  MessageSquare,
  CreditCard,
  Building,
  UserCheck,
  Award,
  TrendingUp,
  Clock,
  MapPin,
  Briefcase,
  School,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@repo/ui/lib/utils'

// Navigation items for Tunisian educational system
const navigationItems = [
  {
    title: 'لوحة التحكم',
    icon: LayoutDashboard,
    url: '/dashboard',
    description: 'نظرة عامة على النشاطات والإحصائيات'
  },
  {
    title: 'إدارة الطلاب',
    icon: GraduationCap,
    description: 'متابعة الطلاب والسجلات الأكاديمية',
    items: [
      { title: 'قائمة الطلاب', url: '/dashboard/students' },
      { title: 'التسجيل الجديد', url: '/dashboard/students/new' },
      { title: 'الحضور والغياب', url: '/dashboard/students/attendance' },
      { title: 'سجل الدرجات', url: '/dashboard/students/grades' },
      { title: 'تقارير الطلاب', url: '/dashboard/students/reports' },
    ]
  },
  {
    title: 'هيئة التدريس',
    icon: Users,
    description: 'إدارة المعلمين والموظفين',
    items: [
      { title: 'قائمة المعلمين', url: '/dashboard/teachers' },
      { title: 'إضافة معلم جديد', url: '/dashboard/teachers/new' },
      { title: 'جداول التدريس', url: '/dashboard/teachers/schedules' },
      { title: 'تقييم الأداء', url: '/dashboard/teachers/evaluations' },
      { title: 'الرواتب والحوافز', url: '/dashboard/teachers/payroll' },
    ]
  },
  {
    title: 'المناهج والمواد',
    icon: BookOpen,
    description: 'إدارة المقررات والمناهج الدراسية',
    items: [
      { title: 'المقررات الدراسية', url: '/dashboard/subjects' },
      { title: 'المناهج التونسية', url: '/dashboard/curricula' },
      { title: 'المكتبة الرقمية', url: '/dashboard/library' },
      { title: 'الامتحانات والاختبارات', url: '/dashboard/exams' },
      { title: 'بنك الأسئلة', url: '/dashboard/question-bank' },
    ]
  },
  {
    title: 'الجدولة والتنظيم',
    icon: Calendar,
    description: 'إدارة الجداول الدراسية والفعاليات',
    items: [
      { title: 'الجدول الدراسي', url: '/dashboard/timetable' },
      { title: 'تقويم المدرسة', url: '/dashboard/calendar' },
      { title: 'الفعاليات والأنشطة', url: '/dashboard/events' },
      { title: 'الإجازات والعطل', url: '/dashboard/holidays' },
      { title: 'إدارة القاعات', url: '/dashboard/classrooms' },
    ]
  },
]

const managementItems = [
  {
    title: 'المالية والإدارة',
    icon: CreditCard,
    description: 'إدارة المدفوعات والميزانية',
    items: [
      { title: 'الرسوم الدراسية', url: '/dashboard/finance/fees' },
      { title: 'المصروفات', url: '/dashboard/finance/expenses' },
      { title: 'التقارير المالية', url: '/dashboard/finance/reports' },
      { title: 'إدارة المرتبات', url: '/dashboard/finance/payroll' },
    ]
  },
  {
    title: 'التقارير والإحصائيات',
    icon: BarChart3,
    description: 'تقارير شاملة وتحليل البيانات',
    items: [
      { title: 'تقارير الأداء', url: '/dashboard/reports/performance' },
      { title: 'إحصائيات الحضور', url: '/dashboard/reports/attendance' },
      { title: 'التقرير الأكاديمي', url: '/dashboard/reports/academic' },
      { title: 'تقارير مخصصة', url: '/dashboard/reports/custom' },
    ]
  },
  {
    title: 'التواصل',
    icon: MessageSquare,
    description: 'التواصل مع أولياء الأمور والطلاب',
    items: [
      { title: 'الإشعارات', url: '/dashboard/communications/notifications' },
      { title: 'رسائل أولياء الأمور', url: '/dashboard/communications/parents' },
      { title: 'الإعلانات', url: '/dashboard/communications/announcements' },
      { title: 'التواصل الداخلي', url: '/dashboard/communications/internal' },
    ]
  },
]

const systemItems = [
  {
    title: 'إعدادات النظام',
    icon: Settings,
    url: '/dashboard/settings',
    description: 'إعدادات المؤسسة والنظام'
  },
  {
    title: 'معلومات المؤسسة',
    icon: Building,
    url: '/dashboard/institution',
    description: 'بيانات وإعدادات المؤسسة التعليمية'
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const [openMenus, setOpenMenus] = useState<string[]>(['main'])

  const toggleMenu = (menuTitle: string) => {
    setOpenMenus(prev =>
      prev.includes(menuTitle)
        ? prev.filter(title => title !== menuTitle)
        : [...prev, menuTitle]
    )
  }

  const isActiveUrl = (url: string) => {
    if (url === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(url)
  }

  const hasActiveChild = (items?: { url: string }[]) => {
    if (!items) return false
    return items.some(item => isActiveUrl(item.url))
  }

  return (
    <Sidebar side="right" className="border-l border-gray-200 dark:border-gray-800">
      <SidebarHeader className="border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="منارة"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <div className={cn(
            "flex flex-col text-right",
            state === "collapsed" && "hidden"
          )}>
            <span className="text-lg font-bold text-gray-900 dark:text-white">منارة</span>
            <span className="text-xs text-gray-500">نظام إدارة المدارس</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-right mb-2">
            الأقسام الرئيسية
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    // Collapsible menu item
                    <>
                      <SidebarMenuButton
                        onClick={() => toggleMenu(item.title)}
                        className={cn(
                          "w-full justify-between text-right",
                          hasActiveChild(item.items) && "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        )}
                        tooltip={state === "collapsed" ? item.title : undefined}
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            state === "collapsed" ? "sr-only" : "block"
                          )}>
                            {item.title}
                          </span>
                          <item.icon className="h-5 w-5" />
                        </div>
                        {state !== "collapsed" && (
                          openMenus.includes(item.title) ?
                            <ChevronDown className="h-4 w-4" /> :
                            <ChevronRight className="h-4 w-4" />
                        )}
                      </SidebarMenuButton>

                      {openMenus.includes(item.title) && state !== "collapsed" && (
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.url}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActiveUrl(subItem.url)}
                                className="text-right"
                              >
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
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
                      tooltip={state === "collapsed" ? item.title : undefined}
                      className="text-right"
                    >
                      <Link href={item.url!}>
                        <span className={cn(
                          state === "collapsed" ? "sr-only" : "block"
                        )}>
                          {item.title}
                        </span>
                        <item.icon className="h-5 w-5" />
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Management Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-right mb-2">
            الإدارة والتحليل
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => toggleMenu(item.title)}
                    className={cn(
                      "w-full justify-between text-right",
                      hasActiveChild(item.items) && "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    )}
                    tooltip={state === "collapsed" ? item.title : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        state === "collapsed" ? "sr-only" : "block"
                      )}>
                        {item.title}
                      </span>
                      <item.icon className="h-5 w-5" />
                    </div>
                    {state !== "collapsed" && (
                      openMenus.includes(item.title) ?
                        <ChevronDown className="h-4 w-4" /> :
                        <ChevronRight className="h-4 w-4" />
                    )}
                  </SidebarMenuButton>

                  {openMenus.includes(item.title) && state !== "collapsed" && (
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.url}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isActiveUrl(subItem.url)}
                            className="text-right"
                          >
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* System Settings */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-right mb-2">
            إعدادات النظام
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActiveUrl(item.url)}
                    tooltip={state === "collapsed" ? item.title : undefined}
                    className="text-right"
                  >
                    <Link href={item.url}>
                      <span className={cn(
                        state === "collapsed" ? "sr-only" : "block"
                      )}>
                        {item.title}
                      </span>
                      <item.icon className="h-5 w-5" />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 dark:border-gray-800 p-4">
        <div className={cn(
          "text-center",
          state === "collapsed" && "hidden"
        )}>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            نسخة ٢.١.٠
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            © ٢٠٢٤ منصة منارة
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}