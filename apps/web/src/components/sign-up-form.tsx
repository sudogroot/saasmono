import { authClient } from '@/lib/auth-client'
import { useForm } from '@tanstack/react-form'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import z from 'zod'
import Loader from './loader'
import { Button } from '@repo/ui'
import { Input } from '@repo/ui'
import { Label } from '@repo/ui'
import { Checkbox } from '@repo/ui'
import { Eye, EyeOff, Mail, Lock, User, UserPlus, AlertCircle, Shield } from 'lucide-react'
import { useState } from 'react'

export default function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const router = useRouter()
  const { isPending } = authClient.useSession()
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
    onSubmit: async ({ value }) => {
      if (!acceptTerms) {
        toast.error('يرجى قبول الشروط والأحكام للمتابعة')
        return
      }

      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: () => {
            router.push('/dashboard')
            toast.success('تم إنشاء الحساب بنجاح! أهلاً بك في منصة منارة')
          },
          onError: (error) => {
            toast.error('خطأ في إنشاء الحساب. يرجى المحاولة مرة أخرى')
          },
        }
      )
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
        email: z.string().email('يرجى إدخال عنوان بريد إلكتروني صحيح'),
        password: z.string()
          .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
          .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم'),
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
        {/* Name Field */}
        <div>
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                  الاسم الكامل
                </Label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id={field.name}
                    name={field.name}
                    type="text"
                    placeholder="أدخل اسمك الكامل"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={`pr-10 text-right h-12 ${
                      field.state.meta.errors.length > 0
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
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
                <Label htmlFor={field.name} className="text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id={field.name}
                    name={field.name}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="أدخل كلمة مرور قوية"
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
                <div className="text-xs text-gray-500 text-right space-y-1">
                  <div>• يجب أن تكون 8 أحرف على الأقل</div>
                  <div>• تحتوي على حرف كبير وصغير ورقم</div>
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

        {/* Terms and Conditions */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Checkbox
            id="terms"
            checked={acceptTerms}
            onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
            className="mt-1"
          />
          <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-300 text-right leading-relaxed cursor-pointer">
            أوافق على{' '}
            <a href="#" className="text-blue-600 hover:text-blue-800 underline">
              الشروط والأحكام
            </a>{' '}
            و{' '}
            <a href="#" className="text-blue-600 hover:text-blue-800 underline">
              سياسة الخصوصية
            </a>{' '}
            الخاصة بمنصة منارة
          </label>
        </div>

        {/* Submit Button */}
        <form.Subscribe>
          {(state) => (
            <Button
              type="submit"
              className="w-full h-12 text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={!state.canSubmit || state.isSubmitting || !acceptTerms}
            >
              {state.isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري إنشاء الحساب...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  <span>إنشاء حساب جديد</span>
                </div>
              )}
            </Button>
          )}
        </form.Subscribe>
      </form>

      {/* Switch to Sign In */}
      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          لديك حساب بالفعل؟{' '}
          <button
            onClick={onSwitchToSignIn}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            تسجيل الدخول
          </button>
        </p>
      </div>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-200 text-right">
            <div className="font-medium mb-1">أمان بياناتك مضمون</div>
            <div className="text-xs opacity-90">
              نحن نحمي معلوماتك الشخصية بأعلى معايير الأمان والتشفير المتقدم
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
