import { authClient } from '@/lib/auth-client'
import { useForm } from '@tanstack/react-form'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import z from 'zod'
import Loader from './loader'
import { Button } from '@repo/ui'
import { Input } from '@repo/ui'
import { Label } from '@repo/ui'
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export default function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const router = useRouter()
  const { isPending } = authClient.useSession()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            router.push('/dashboard')
            toast.success('تم تسجيل الدخول بنجاح')
          },
          onError: (error) => {
            toast.error('خطأ في تسجيل الدخول. تحقق من البيانات وحاول مرة أخرى')
          },
        }
      )
    },
    validators: {
      onSubmit: z.object({
        email: z.string().email('يرجى إدخال عنوان بريد إلكتروني صحيح'),
        password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
      }),
    },
  })

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader />
      </div>
    )
  }

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-6"
      >
        {/* Email Field */}
        <div>
          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                  البريد الإلكتروني
                </Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={`pr-10 text-right h-12 ${
                      field.state.meta.errors.length > 0
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    dir="ltr"
                  />
                </div>
                {field.state.meta.errors.map((error) => (
                  <div key={error?.message} className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error?.message}</span>
                  </div>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        {/* Password Field */}
        <div>
          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    نسيت كلمة المرور؟
                  </button>
                  <Label htmlFor={field.name} className="text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                    كلمة المرور
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id={field.name}
                    name={field.name}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="أدخل كلمة المرور"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={`pr-10 pl-10 text-right h-12 ${
                      field.state.meta.errors.length > 0
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {field.state.meta.errors.map((error) => (
                  <div key={error?.message} className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error?.message}</span>
                  </div>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        {/* Submit Button */}
        <form.Subscribe>
          {(state) => (
            <Button
              type="submit"
              className="w-full h-12 text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={!state.canSubmit || state.isSubmitting}
            >
              {state.isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري تسجيل الدخول...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="h-5 w-5" />
                  <span>تسجيل الدخول</span>
                </div>
              )}
            </Button>
          )}
        </form.Subscribe>
      </form>

      {/* Switch to Sign Up */}
      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          ليس لديك حساب؟{' '}
          <button
            onClick={onSwitchToSignUp}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            إنشاء حساب جديد
          </button>
        </p>
      </div>

      {/* Demo Credentials */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-right">
          للتجربة السريعة:
        </h4>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 text-right">
          <div dir="ltr" className="text-left">
            <div>البريد الإلكتروني: demo@manarah.com</div>
            <div>كلمة المرور: demo123456</div>
          </div>
        </div>
      </div>
    </div>
  )
}
