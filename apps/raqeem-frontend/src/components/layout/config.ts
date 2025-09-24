import {
  Calendar,
  Gavel,
  Scale,
  LayoutDashboard,
  Users,
  FileText,
  Building,
  UserCog,
  Settings,
  Clock,
  DollarSign,
  BarChart3,
  Search,
  Plus,
  Home,
  UserX,
  X
} from "lucide-react";
export const mainNavItems = [
  {
    title: "التقويم",
    href: "calendar",
    icon: Calendar,
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    title: "الجلسات",
    href: "trials",
    icon: Gavel,
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    title: "القضايا",
    href: "cases",
    icon: Scale,
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    title: "الرئيسية",
    href: "",
    icon: LayoutDashboard,
    color: "text-primary",
    bgColor: "bg-primary/10"
  }
];

export const drawerItems = [
  {
    category: "العملاء والأطراف",
    items: [
      {
        title: "العملاء",
        href: "clients",
        icon: Users,
        description: "إدارة ملفات العملاء"
      },
      {
        title: "الخصوم",
        href: "opponents",
        icon: UserCog,
        description: "إدارة الأطراف المقابلة"
      }
    ]
  },
  {
    category: "المحاكم والمواعيد",
    items: [
      {
        title: "المحاكم",
        href: "courts",
        icon: Building,
        description: "قائمة المحاكم والجهات"
      },
      {
        title: "المواعيد",
        href: "appointments",
        icon: Clock,
        description: "جدولة المواعيد"
      }
    ]
  },
  {
    category: "الوثائق والتقارير",
    items: [
      {
        title: "الوثائق",
        href: "documents",
        icon: FileText,
        description: "إدارة الملفات والوثائق"
      },
      {
        title: "التقارير",
        href: "reports",
        icon: BarChart3,
        description: "التقارير والإحصائيات"
      }
    ]
  },
  {
    category: "المالية والإدارة",
    items: [
      {
        title: "الفواتير",
        href: "billing",
        icon: DollarSign,
        description: "إدارة الفواتير والمدفوعات"
      },
      {
        title: "الإعدادات",
        href: "settings",
        icon: Settings,
        description: "إعدادات المؤسسة"
      }
    ]
  }
];

export const quickActions = [
  {
    title: "قضية جديدة",
    icon: Plus,
    action: "create-case",
    color: "bg-blue-600 text-white"
  },
  {
    title: "عميل جديد",
    icon: Plus,
    action: "create-client",
    color: "bg-green-600 text-white"
  },
  {
    title: "موعد جديد",
    icon: Plus,
    action: "create-appointment",
    color: "bg-purple-600 text-white"
  },
  {
    title: "بحث سريع",
    icon: Search,
    action: "search",
    color: "bg-gray-600 text-white"
  }
];


export const breadcrumbs: any= {
  "/dashboard" : "الرئيسية",
  "/dashboard/clients" : "عملاء",
}



// Navigation items for the dashboard
export const navigationItems = [
  {
    title: "لوحة التحكم",
    icon: Home,
    href: "",
  },
  {
    title: "العملاء",
    icon: Users,
    href: "/clients",
  },
  {
    title: "القضايا",
    icon: Scale,
    href: "/cases",
  },
  {
    title: "الخصوم",
    icon: UserX,
    href: "/opponents",
  },
  {
    title: "الجلسات",
    icon: Gavel,
    href: "/trials",
  },
  {
    title: "المواعيد",
    icon: Calendar,
    href: "/appointments",
  },
  {
    title: "الوثائق",
    icon: FileText,
    href: "/documents",
  },
];
