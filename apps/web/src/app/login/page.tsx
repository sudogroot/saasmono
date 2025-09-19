'use client'

import SignInForm from '@/components/sign-in-form'
import SignUpForm from '@/components/sign-up-form'
import { Button, Card, CardContent } from '@repo/ui'
import { GraduationCap, Users, BookOpen, Calendar, ArrowRight, Home } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function LoginPage() {
  const [showSignIn, setShowSignIn] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950" dir="rtl">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md dark:bg-gray-900/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <ArrowRight className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">العودة للرئيسية</span>
            </Link>
            <div className="flex items-center gap-3">
              <Image
                src="/logo-and-text.svg"
                alt="منارة"
                width={120}
                height={32}
                className="h-8"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 bg-gradient-to-br from-blue-600 to-purple-700 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-32 h-32 rounded-full border border-white/20"></div>
            <div className="absolute bottom-32 left-16 w-24 h-24 rounded-full border border-white/20"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full border border-white/20"></div>
          </div>

          <div className="relative z-10 max-w-lg mr-auto">
            <h1 className="text-4xl font-bold mb-6 text-right leading-tight">
              أهلاً بك في
              <br />
              <span className="text-yellow-300">منصة منارة</span>
            </h1>
            <p className="text-xl opacity-90 mb-12 text-right leading-relaxed">
              منصة متكاملة لإدارة المؤسسات التعليمية بأحدث التقنيات العالمية
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: <GraduationCap className="h-6 w-6" />,
                  title: 'إدارة شاملة للطلاب',
                  description: 'متابعة الحضور والدرجات والسلوك الأكاديمي'
                },
                {
                  icon: <Users className="h-6 w-6" />,
                  title: 'تنظيم فريق التدريس',
                  description: 'إدارة المعلمين والموظفين بنظام صلاحيات متقدم'
                },
                {
                  icon: <BookOpen className="h-6 w-6" />,
                  title: 'مناهج تفاعلية',
                  description: 'أدوات تعليمية حديثة ومحتوى رقمي متطور'
                },
                {
                  icon: <Calendar className="h-6 w-6" />,
                  title: 'جدولة ذكية',
                  description: 'تنظيم الحصص والامتحانات تلقائياً'
                }
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                    {feature.icon}
                  </div>
                  <div className="text-right">
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm opacity-80">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="text-right">
                  <div className="text-2xl font-bold">٩٩.٩%</div>
                  <div className="text-sm opacity-80">وقت التشغيل</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">١٠٠+</div>
                  <div className="text-sm opacity-80">مؤسسة تعليمية</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">٥٠k+</div>
                  <div className="text-sm opacity-80">مستخدم نشط</div>
                </div>
              </div>
              <p className="text-sm opacity-80 text-right">
                ✨ منصة موثوقة من قبل أفضل المؤسسات التعليمية في المنطقة
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="mb-4 lg:hidden">
                    <Image
                      src="/logo-and-text.svg"
                      alt="منارة"
                      width={150}
                      height={40}
                      className="h-10 mx-auto"
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {showSignIn ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {showSignIn
                      ? 'أدخل بياناتك للوصول إلى حسابك'
                      : 'انضم إلى منصة منارة واكتشف مستقبل التعليم الرقمي'
                    }
                  </p>
                </div>

                {showSignIn ? (
                  <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
                ) : (
                  <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
                )}
              </CardContent>
            </Card>

            {/* Mobile Features Preview */}
            <div className="lg:hidden mt-8">
              <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                <CardContent className="p-6 text-center">
                  <h3 className="font-bold mb-3">لماذا منصة منارة؟</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <GraduationCap className="h-6 w-6 mx-auto mb-2" />
                      <div>إدارة الطلاب</div>
                    </div>
                    <div>
                      <Users className="h-6 w-6 mx-auto mb-2" />
                      <div>إدارة المعلمين</div>
                    </div>
                    <div>
                      <BookOpen className="h-6 w-6 mx-auto mb-2" />
                      <div>المناهج الرقمية</div>
                    </div>
                    <div>
                      <Calendar className="h-6 w-6 mx-auto mb-2" />
                      <div>الجدولة الذكية</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
