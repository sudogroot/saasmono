import { authClient } from '@/lib/auth-client'
import { Button, Input, Label } from '@repo/ui'
import { useForm } from '@tanstack/react-form'
import { DoorOpen, Lock, Mail, User } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import z from 'zod'
import Loader from './loader'

export default function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const router = useRouter()
  const { isPending } = authClient.useSession()

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: async () => {
            const organization = await authClient.organization.create({
              name: `${value.name}-${value.email}-${Date.now()}`,
              slug: `${value.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
              keepCurrentActiveOrganization: false,
            })

            await authClient.organization.setActive({
              organizationId: organization.data?.id,
            })

            router.push('/dashboard')
            toast.success('Sign up successful')
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText)
          },
        }
      )
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
      }),
    },
  })

  if (isPending) {
    return <Loader />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-white p-2">
      <div className="w-full max-w-md">
        <div className="space-y-6 rounded-2xl border bg-white p-8 shadow-2xl">
          {/* Logo and Header */}
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="mb-2 flex items-center justify-center">
                <Image src="/raqeem-logo.svg" alt="Logo" width={170} height={60} />
              </div>
            </div>
            <div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">إنشاء حساب جديد</h1>
              <p className="text-gray-600">انضم إلى رقيم وابدأ رحلتك القانونية</p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-6"
          >
            <div>
              <form.Field name="name">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="font-medium text-gray-700">
                      الاسم الكامل
                    </Label>
                    <div className="relative">
                      <User className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                      <Input
                        id={field.name}
                        name={field.name}
                        placeholder="اكتب اسمك الكامل"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="focus:border-primary focus:ring-primary/20 h-12 rounded-lg border-gray-200 pl-10"
                      />
                    </div>
                    {field.state.meta.errors.map((error) => (
                      <p key={error?.message} className="text-sm text-red-500">
                        {error?.message}
                      </p>
                    ))}
                  </div>
                )}
              </form.Field>
            </div>

            <div>
              <form.Field name="email">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="font-medium text-gray-700">
                      البريد الإلكتروني
                    </Label>
                    <div className="relative">
                      <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        placeholder="اكتب بريدك الإلكتروني"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="focus:border-primary focus:ring-primary/20 h-12 rounded-lg border-gray-200 pl-10"
                      />
                    </div>
                    {field.state.meta.errors.map((error) => (
                      <p key={error?.message} className="text-sm text-red-500">
                        {error?.message}
                      </p>
                    ))}
                  </div>
                )}
              </form.Field>
            </div>

            <div>
              <form.Field name="password">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="font-medium text-gray-700">
                      كلمة المرور
                    </Label>
                    <div className="relative">
                      <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        placeholder="اختر كلمة مرور قوية"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="focus:border-primary focus:ring-primary/20 h-12 rounded-lg border-gray-200 pl-10"
                      />
                    </div>
                    {field.state.meta.errors.map((error) => (
                      <p key={error?.message} className="text-sm text-red-500">
                        {error?.message}
                      </p>
                    ))}
                  </div>
                )}
              </form.Field>
            </div>

            <form.Subscribe>
              {(state) => (
                <Button
                  type="submit"
                  className="relative h-12 w-full transform overflow-hidden border-2 border-slate-600 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 text-lg font-semibold text-white shadow-xl transition-all duration-300 ease-out before:absolute before:inset-0 before:translate-x-[-100%] before:rounded-lg before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-transform before:duration-700 hover:from-slate-800 hover:via-slate-600 hover:to-slate-800"
                  disabled={!state.canSubmit || state.isSubmitting}
                >
                  <span className="relative z-10">{state.isSubmitting ? 'جارٍ إنشاء الحساب...' : 'إنشاء الحساب'}</span>
                </Button>
              )}
            </form.Subscribe>
          </form>

          <div className="text-center">
            <p className="mb-2 text-gray-600">لديك حساب بالفعل؟</p>
            <Button
              variant="link"
              onClick={onSwitchToSignIn}
              className="text-primary hover:text-primary/80 font-medium underline"
            >
              <DoorOpen className="mr-1" />
              تسجيل الدخول
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
