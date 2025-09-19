'use client'

import { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui'
import {
  GraduationCap,
  Users,
  BookOpen,
  TrendingUp,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'

export default function Dashboard() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  const privateData = useQuery(orpc.privateData.queryOptions())

  useEffect(() => {
    if (!session && !isPending) {
      router.push('/login')
    }
  }, [session, isPending])

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  // Sample data for demonstration
  const stats = [
    {
      title: 'إجمالي الطلاب',
      value: '١,٢٣٤',
      change: '+٨.٢%',
      changeType: 'positive' as const,
      icon: GraduationCap,
      description: 'مقارنة بالشهر الماضي'
    },
    {
      title: 'هيئة التدريس',
      value: '٩٨',
      change: '+٢.١%',
      changeType: 'positive' as const,
      icon: Users,
      description: 'معلم ومعلمة نشطين'
    },
    {
      title: 'المقررات الدراسية',
      value: '٤٥',
      change: '+١٢.٥%',
      changeType: 'positive' as const,
      icon: BookOpen,
      description: 'مقرر دراسي متاح'
    },
    {
      title: 'معدل الحضور',
      value: '٩٥.٣%',
      change: '-١.٧%',
      changeType: 'negative' as const,
      icon: TrendingUp,
      description: 'هذا الأسبوع'
    },
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'student_enrolled',
      title: 'تسجيل طالب جديد',
      description: 'محمد أحمد السالمي - الصف الثامن أ',
      time: 'منذ ١٠ دقائق',
      icon: GraduationCap,
      status: 'success'
    },
    {
      id: 2,
      type: 'grade_updated',
      title: 'تحديث الدرجات',
      description: 'امتحان الرياضيات - الصف السابع ب',
      time: 'منذ ٣٠ دقيقة',
      icon: CheckCircle,
      status: 'info'
    },
    {
      id: 3,
      type: 'attendance_alert',
      title: 'تنبيه غياب',
      description: 'معدل غياب مرتفع في الصف التاسع ج',
      time: 'منذ ساعة',
      icon: AlertCircle,
      status: 'warning'
    },
    {
      id: 4,
      type: 'schedule_change',
      title: 'تعديل الجدول',
      description: 'تم تغيير موعد حصة الفيزياء',
      time: 'منذ ٢ ساعة',
      icon: Calendar,
      status: 'info'
    },
  ]

  const upcomingEvents = [
    {
      id: 1,
      title: 'اجتماع أولياء الأمور',
      date: 'الثلاثاء ٢٥ سبتمبر',
      time: '٤:٠٠ مساءً',
      type: 'meeting'
    },
    {
      id: 2,
      title: 'امتحان الرياضيات النهائي',
      date: 'الخميس ٢٧ سبتمبر',
      time: '٨:٠٠ صباحاً',
      type: 'exam'
    },
    {
      id: 3,
      title: 'يوم رياضي مدرسي',
      date: 'السبت ٢٩ سبتمبر',
      time: '٩:٠٠ صباحاً',
      type: 'event'
    },
  ]

  return (
    <div className="space-y-6" dir="rtl">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          مرحباً بك، {session?.user.name || 'المستخدم'} 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          إليك نظرة سريعة على نشاط مدرستك اليوم
        </p>
        {privateData.data && (
          <p className="text-sm text-green-600 mt-2">
            ✅ {privateData.data.message}
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    stat.changeType === 'positive'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-xs text-gray-500">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-right">النشاطات الأخيرة</CardTitle>
            <CardDescription className="text-right">
              آخر التحديثات في النظام
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className={`p-2 rounded-lg ${
                  activity.status === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' :
                  activity.status === 'warning' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400' :
                  'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                }`}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 text-right">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-right">الفعاليات القادمة</CardTitle>
            <CardDescription className="text-right">
              المواعيد والأحداث المهمة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="flex-1 text-right">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {event.title}
                  </h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {event.date}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {event.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">إجراءات سريعة</CardTitle>
          <CardDescription className="text-right">
            الوظائف الأكثر استخداماً
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: 'إضافة طالب جديد', icon: GraduationCap, color: 'blue' },
              { title: 'تسجيل حضور', icon: CheckCircle, color: 'green' },
              { title: 'إنشاء تقرير', icon: TrendingUp, color: 'purple' },
              { title: 'إرسال إشعار', icon: AlertCircle, color: 'orange' },
            ].map((action, index) => (
              <button
                key={index}
                className="p-4 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors text-center group"
              >
                <action.icon className="h-8 w-8 mx-auto mb-2 text-gray-400 group-hover:text-blue-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">
                  {action.title}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
