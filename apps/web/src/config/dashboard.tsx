import {
  BarChart3,
  BookOpen,
  Building,
  Calendar,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
} from 'lucide-react'
import type { SidebarSection, Notification, UserInfo, QuickAction } from '@repo/ui'

// Navigation sections for Tunisian educational system
export const dashboardSidebarSections: SidebarSection[] = [
  {
    title: 'الأقسام الرئيسية',
    items: [
      {
        title: 'لوحة التحكم',
        icon: LayoutDashboard,
        url: '/dashboard',
        description: 'نظرة عامة على النشاطات والإحصائيات',
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
        ],
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
        ],
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
        ],
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
        ],
      },
    ],
  },
  {
    title: 'الإدارة والتحليل',
    items: [
      {
        title: 'المالية والإدارة',
        icon: CreditCard,
        description: 'إدارة المدفوعات والميزانية',
        items: [
          { title: 'الرسوم الدراسية', url: '/dashboard/finance/fees' },
          { title: 'المصروفات', url: '/dashboard/finance/expenses' },
          { title: 'التقارير المالية', url: '/dashboard/finance/reports' },
          { title: 'إدارة المرتبات', url: '/dashboard/finance/payroll' },
        ],
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
        ],
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
        ],
      },
    ],
  },
  {
    title: 'إعدادات النظام',
    items: [
      {
        title: 'إعدادات النظام',
        icon: Settings,
        url: '/dashboard/settings',
        description: 'إعدادات المؤسسة والنظام',
      },
      {
        title: 'معلومات المؤسسة',
        icon: Building,
        url: '/dashboard/institution',
        description: 'بيانات وإعدادات المؤسسة التعليمية',
      },
    ],
  },
]

export const dashboardNotifications: Notification[] = [
  { id: 1, title: 'طالب جديد تم تسجيله', time: 'منذ ٥ دقائق', unread: true },
  { id: 2, title: 'تحديث في جدول الحصص', time: 'منذ ١٥ دقيقة', unread: true },
  { id: 3, title: 'تقرير الحضور الأسبوعي جاهز', time: 'منذ ٣٠ دقيقة', unread: false },
]

export const dashboardUser: UserInfo = {
  name: 'أحمد محمد السليماني',
  role: 'مدير المدرسة',
  email: 'ahmed.mohamed@school.tn',
  avatar: '/avatars/01.png',
  initials: 'أم',
}

export const dashboardQuickActions: QuickAction[] = [
  {
    label: 'التقويم',
    icon: Calendar,
    onClick: () => console.log('Navigate to calendar'),
  },
  {
    label: 'الرسائل',
    icon: MessageSquare,
    onClick: () => console.log('Navigate to messages'),
  },
]