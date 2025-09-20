import { authClient } from '@/lib/auth-client'
import { Button, Input, Label } from '@repo/ui'
import { useForm } from '@tanstack/react-form'
import { AlertCircle, Eye, EyeOff, Lock, LogIn, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import z from 'zod'
import Loader from './loader'

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
                  <Mail className="absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={`h-12 pr-10 text-right ${
                      field.state.meta.errors.length > 0
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    dir="ltr"
                  />
                </div>
                {field.state.meta.errors.map((error) => (
                  <div key={error?.message} className="flex items-center gap-2 text-sm text-red-500">
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
                  <button type="button" className="text-sm text-blue-600 transition-colors hover:text-blue-800">
                    نسيت كلمة المرور؟
                  </button>
                  <Label
                    htmlFor={field.name}
                    className="text-right text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    كلمة المرور
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    id={field.name}
                    name={field.name}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="أدخل كلمة المرور"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={`h-12 pr-10 pl-10 text-right ${
                      field.state.meta.errors.length > 0
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400 transition-colors hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {field.state.meta.errors.map((error) => (
                  <div key={error?.message} className="flex items-center gap-2 text-sm text-red-500">
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
              className="h-12 w-full border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-lg font-medium text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
              disabled={!state.canSubmit || state.isSubmitting}
            >
              {state.isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
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
      {/*<div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          ليس لديك حساب؟{' '}
          <button
            onClick={onSwitchToSignUp}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            إنشاء حساب جديد
          </button>
        </p>
      </div>*/}
    </div>
  )
}
