import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  Settings,
  BarChart3,
  FileText,
  GraduationCap,
  School
} from 'lucide-react'

export const dashboardSidebarSections = [
  {
    title: 'القائمة الرئيسية',
    items: [
      {
        title: 'لوحة التحكم',
        icon: LayoutDashboard,
        url: '/dashboard',
      },
      {
        title: 'إدارة الطلاب',
        icon: Users,
        url: '/dashboard/students',
        items: [
          { title: 'قائمة الطلاب', url: '/dashboard/students' },
          { title: 'إضافة طالب', url: '/dashboard/students/new' },
        ]
      },
      {
        title: 'إدارة المعلمين',
        icon: GraduationCap,
        url: '/dashboard/teachers',
        items: [
          { title: 'قائمة المعلمين', url: '/dashboard/teachers' },
          { title: 'إضافة معلم', url: '/dashboard/teachers/new' },
        ]
      },
      {
        title: 'المناهج الدراسية',
        icon: BookOpen,
        url: '/dashboard/curriculum',
        items: [
          { title: 'المواد الدراسية', url: '/dashboard/curriculum/subjects' },
          { title: 'الصفوف الدراسية', url: '/dashboard/curriculum/grades' },
        ]
      },
      {
        title: 'الجدول الدراسي',
        icon: Calendar,
        url: '/dashboard/schedule',
      },
      {
        title: 'التقارير',
        icon: BarChart3,
        url: '/dashboard/reports',
        items: [
          { title: 'تقارير الحضور', url: '/dashboard/reports/attendance' },
          { title: 'تقارير الدرجات', url: '/dashboard/reports/grades' },
        ]
      },
    ]
  },
  {
    title: 'الإدارة',
    items: [
      {
        title: 'إعدادات المدرسة',
        icon: School,
        url: '/dashboard/school-settings',
      },
      {
        title: 'الإعدادات العامة',
        icon: Settings,
        url: '/dashboard/settings',
      },
    ]
  }
]

export const dashboardNotifications = [
  {
    id: '1',
    title: 'طالب جديد',
    message: 'تم تسجيل طالب جديد في الصف الثالث الابتدائي',
    time: 'منذ 5 دقائق',
    isRead: false,
    type: 'info' as const,
  },
  {
    id: '2',
    title: 'اجتماع الأساتذة',
    message: 'اجتماع طاقم التدريس اليوم الساعة 2:00 مساءً',
    time: 'منذ ساعة',
    isRead: false,
    type: 'warning' as const,
  },
  {
    id: '3',
    title: 'نتائج الامتحانات',
    message: 'تم رفع نتائج امتحانات الفصل الأول',
    time: 'منذ يومين',
    isRead: true,
    type: 'success' as const,
  },
]

export const dashboardUser = {
  name: 'أحمد محمد',
  email: 'ahmed@school.edu.sa',
  avatar: '/avatars/teacher.jpg',
  initials: 'أم',
}

export const dashboardQuickActions = [
  {
    id: 'add-student',
    label: 'إضافة طالب',
    icon: Users,
    onClick: () => window.location.href = '/dashboard/students/new',
  },
  {
    id: 'new-report',
    label: 'تقرير جديد',
    icon: FileText,
    onClick: () => window.location.href = '/dashboard/reports/new',
  },
]