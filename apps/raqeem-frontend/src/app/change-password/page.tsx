'use client'

import { authClient } from '@/lib/auth-client'
import { client } from '@/utils/orpc'
import { Button, Heading, Input, Label, Text } from '@repo/ui'
import { Lock, Shield } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const router = useRouter()

  const validateForm = () => {
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }

    let isValid = true

    if (!currentPassword) {
      newErrors.currentPassword = 'يرجى إدخال كلمة المرور الحالية'
      isValid = false
    }

    if (!newPassword) {
      newErrors.newPassword = 'يرجى إدخال كلمة المرور الجديدة'
      isValid = false
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
      isValid = false
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = 'كلمة المرور الجديدة يجب أن تكون مختلفة عن القديمة'
      isValid = false
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'يرجى تأكيد كلمة المرور'
      isValid = false
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Use Better Auth's changePassword API endpoint directly
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000'}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for session cookies
        body: JSON.stringify({
          currentPassword,
          newPassword,
          revokeOtherSessions: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 401) {
          throw new Error('current password is incorrect')
        }
        throw new Error(errorData.message || 'Failed to change password')
      }

      // Update passwordChangeRequired flag via backend API
      await client.user.completePasswordChange()

      // Set active organization if not already set
      const organizations = await authClient.organization.list()
      if (organizations?.data?.[0]?.id) {
        await authClient.organization.setActive({
          organizationId: organizations.data[0].id,
        })
      }

      toast.success('تم تغيير كلمة المرور بنجاح')

      // Force a full page reload to ensure fresh session data
      // This prevents the PasswordChangeGuard from seeing stale session cache
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Password change error:', error)
      if (error instanceof Error) {
        if (error.message.includes('current password')) {
          toast.error('كلمة المرور الحالية غير صحيحة')
        } else {
          toast.error('حدث خطأ، يرجى المحاولة مرة أخرى')
        }
      } else {
        toast.error('حدث خطأ، يرجى المحاولة مرة أخرى')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-white p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="space-y-6 rounded-2xl border bg-white p-8 shadow-2xl">
          {/* Logo and Header */}
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="mb-2 flex items-center justify-center">
                <Image src="/raqeem-logo.svg" alt="Logo" width={170} height={60} />
              </div>
            </div>

            {/* Security Badge */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-2 text-white shadow-lg">
                <Shield className="h-4 w-4" />
                <span className="text-xs font-semibold">تغيير كلمة المرور مطلوب</span>
              </div>
            </div>

            <div>
              <Heading level={1} className="mb-2 text-gray-900">
                تغيير كلمة المرور
              </Heading>
              <Text className="text-gray-600">
                يرجى تغيير كلمة المرور المؤقتة إلى كلمة مرور جديدة وآمنة
              </Text>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="font-medium text-gray-700">
                كلمة المرور الحالية
              </Label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  placeholder="اكتب كلمة المرور الحالية"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value)
                    if (errors.currentPassword) {
                      setErrors({ ...errors, currentPassword: '' })
                    }
                  }}
                  onBlur={() => {
                    if (!currentPassword) {
                      setErrors({ ...errors, currentPassword: 'يرجى إدخال كلمة المرور الحالية' })
                    }
                  }}
                  className={`focus:border-primary focus:ring-primary/20 h-12 rounded-lg pl-10 ${
                    errors.currentPassword ? 'border-red-500' : 'border-gray-200'
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.currentPassword && (
                <Text size="sm" className="text-red-500">
                  {errors.currentPassword}
                </Text>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="font-medium text-gray-700">
                كلمة المرور الجديدة
              </Label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="اكتب كلمة المرور الجديدة"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    if (errors.newPassword) {
                      setErrors({ ...errors, newPassword: '' })
                    }
                  }}
                  onBlur={() => {
                    if (!newPassword) {
                      setErrors({ ...errors, newPassword: 'يرجى إدخال كلمة المرور الجديدة' })
                    } else if (newPassword.length < 8) {
                      setErrors({ ...errors, newPassword: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
                    } else if (newPassword === currentPassword) {
                      setErrors({ ...errors, newPassword: 'كلمة المرور الجديدة يجب أن تكون مختلفة عن القديمة' })
                    }
                  }}
                  className={`focus:border-primary focus:ring-primary/20 h-12 rounded-lg pl-10 ${
                    errors.newPassword ? 'border-red-500' : 'border-gray-200'
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.newPassword ? (
                <Text size="sm" className="text-red-500">
                  {errors.newPassword}
                </Text>
              ) : (
                <Text size="sm" className="text-gray-500">
                  يجب أن تكون 8 أحرف على الأقل
                </Text>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-medium text-gray-700">
                تأكيد كلمة المرور
              </Label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="أعد كتابة كلمة المرور الجديدة"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (errors.confirmPassword) {
                      setErrors({ ...errors, confirmPassword: '' })
                    }
                  }}
                  onBlur={() => {
                    if (!confirmPassword) {
                      setErrors({ ...errors, confirmPassword: 'يرجى تأكيد كلمة المرور' })
                    } else if (newPassword !== confirmPassword) {
                      setErrors({ ...errors, confirmPassword: 'كلمات المرور غير متطابقة' })
                    }
                  }}
                  className={`focus:border-primary focus:ring-primary/20 h-12 rounded-lg pl-10 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.confirmPassword && (
                <Text size="sm" className="text-red-500">
                  {errors.confirmPassword}
                </Text>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="relative h-12 w-full transform overflow-hidden border-2 border-slate-600 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 text-lg font-semibold text-white shadow-xl transition-all duration-300 ease-out hover:from-slate-800 hover:via-slate-600 hover:to-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={
                isSubmitting ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword ||
                !!errors.currentPassword ||
                !!errors.newPassword ||
                !!errors.confirmPassword
              }
            >
              <span className="relative z-10">
                {isSubmitting ? 'جارٍ التغيير...' : 'تغيير كلمة المرور'}
              </span>
            </Button>
          </form>

          {/* Security Notice */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 flex-shrink-0 text-blue-600" />
              <div className="space-y-1">
                <Text size="sm" className="font-semibold text-blue-900">
                  نصائح الأمان
                </Text>
                <ul className="space-y-1 text-xs text-blue-700">
                  <li>• استخدم كلمة مرور قوية ومختلفة</li>
                  <li>• لا تشارك كلمة المرور مع أي شخص</li>
                  <li>• احفظ كلمة المرور في مكان آمن</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
