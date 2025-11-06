'use client'

import { authClient } from '@/lib/auth-client'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Component that checks if user needs to change password and redirects if needed
 * Place this in the dashboard layout to enforce password change on first login
 */
export function PasswordChangeGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    // Don't redirect if we're already on the change password page
    if (pathname === '/change-password') {
      return
    }

    // Wait for session to load
    if (isPending) {
      return
    }

    // Check if user is logged in and needs to change password
    if (session?.user) {
      // @ts-expect-error - passwordChangeRequired is a custom field
      const needsPasswordChange = session.user.passwordChangeRequired === true

      if (needsPasswordChange) {
        router.push('/change-password')
      }
    }
  }, [session, isPending, pathname, router])

  // Show children if no redirect is needed
  return <>{children}</>
}
