'use client'

import { Header } from '@/components/landing'
import { Button, Card, CardContent, Heading, Text } from '@repo/ui'
import { orpc } from '@/utils/orpc'
import { CheckCircle, Loader2, Mail, Phone, User, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function InterestPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    wantsDemo: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await orpc.interest.createInterestRequest.mutate(formData)

      if (response.success) {
        setIsSuccess(true)
        toast.success(response.message)
      }
    } catch (error) {
      toast.error('حدث خطأ، يرجى المحاولة مرة أخرى')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50" dir="rtl">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <Card className="max-w-md w-full border-2 border-green-200 shadow-xl">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <div className="space-y-3">
                <Heading level={2} className="text-2xl font-bold text-gray-900">
                  شكراً لاهتمامك!
                </Heading>
                <Text className="text-gray-600 leading-relaxed">
                  تم استلام طلبك بنجاح. سنتواصل معك قريباً عبر البريد الإلكتروني أو الهاتف.
                </Text>
              </div>
              <Button
                onClick={() => (window.location.href = '/')}
                className="w-full"
              >
                العودة للصفحة الرئيسية
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50" dir="rtl">
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center space-y-4 mb-8">
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-full px-5 py-2 shadow-lg">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-semibold text-xs">برنامج الوصول المبكر</span>
                </div>
              </div>
              <Heading level={2} className="text-2xl font-bold text-gray-900">
                سجل اهتمامك
              </Heading>
              <Text className="text-gray-600">
                املأ النموذج وسنتواصل معك قريباً
              </Text>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="h-4 w-4" />
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="أدخل اسمك الكامل"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Mail className="h-4 w-4" />
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Phone className="h-4 w-4" />
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  required
                  minLength={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="+216 XX XXX XXX"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>

              {/* Demo Checkbox */}
              <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={formData.wantsDemo}
                    onChange={(e) => setFormData({ ...formData, wantsDemo: e.target.checked })}
                  />
                  <div className="flex-1">
                    <Text className="font-medium text-gray-900 text-sm">
                      أرغب في حجز عرض توضيحي
                    </Text>
                    <Text className="text-gray-600 text-xs mt-1">
                      سنتواصل معك لتحديد موعد مناسب لعرض المنصة
                    </Text>
                  </div>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 text-base font-semibold shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <CheckCircle className="ml-2 h-5 w-5" />
                    إرسال الطلب
                  </>
                )}
              </Button>
            </form>

            {/* Footer Note */}
            <div className="mt-6 text-center">
              <Text className="text-xs text-gray-500">
                بإرسال هذا النموذج، أنت توافق على سياسة الخصوصية الخاصة بنا
              </Text>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
