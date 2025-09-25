import { Gavel, LayoutDashboard, UserPlus, Users } from 'lucide-react'

export const raqeemDashboardSidebarData = {
  navMain: [
    {
      title: 'لوحة التحكم',
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'القضايا',
      url: '/dashboard/cases',
      icon: Gavel,
    },
    {
      title: 'الموكلين',
      url: '/dashboard/clients',
      icon: Users,
    },
    {
      title: 'الخصوم',
      url: '/dashboard/opponents',
      icon: UserPlus,
    },
  ],
  // navClouds: [],
  navSecondary: [
    // {
    //   title: 'الإعدادات',
    //   url: '/dashboard/settings',
    //   icon: Settings,
    // },
    // {
    //   title: 'المساعدة',
    //   url: '#',
    //   icon: HelpCircle,
    // },
    // {
    //   title: 'البحث',
    //   url: '#',
    //   icon: Search,
    // },
  ],
  documents: [
    // {
    //   name: 'مكتبة المستندات',
    //   url: '#',
    //   icon: Database,
    // },
    // {
    //   name: 'التقارير',
    //   url: '#',
    //   icon: FileBarChart,
    // },
    // {
    //   name: 'الملفات القانونية',
    //   url: '#',
    //   icon: FileText,
    // },
  ],
}
