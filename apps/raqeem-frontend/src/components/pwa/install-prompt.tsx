'use client'

import { Button, Card } from '@repo/ui'
import { Download, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Enhanced mobile detection - ONLY show on actual mobile devices
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()

      // Check for mobile/tablet devices in user agent
      const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)

      // Check if it's a touch device
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

      // Check screen size (mobile/tablet range)
      const isMobileScreen = window.innerWidth <= 768

      // Must be mobile user agent AND (touch device OR mobile screen)
      return isMobileUserAgent && (isTouchDevice || isMobileScreen)
    }

    const isMobileDevice = checkMobile()
    setIsMobile(isMobileDevice)

    // STOP HERE if not mobile - don't set up any listeners
    if (!isMobileDevice) {
      return
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIOSDevice)

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedDate = new Date(dismissed)
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)

      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)

      // Show the prompt after a short delay (better UX)
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Handle app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setShowPrompt(false)
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString())
  }

  // CRITICAL: Don't show if not mobile
  if (!isMobile) {
    return null
  }

  // Don't show if already installed or user not on supported platform
  if (isInstalled || (!deferredPrompt && !isIOS)) {
    return null
  }

  // Don't show the card if user dismissed it
  if (!showPrompt) {
    return null
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md border-2 border-primary/20 shadow-2xl sm:bottom-6 sm:left-auto sm:right-6">
      <div className="relative p-4">
        <button
          onClick={handleDismiss}
          className="absolute left-2 top-2 rounded-full p-1 transition-colors hover:bg-muted"
          aria-label="إغلاق"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="bg-primary/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg">
            <Download className="text-primary h-6 w-6" />
          </div>

          <div className="flex-1 space-y-2">
            <div>
              <h3 className="text-sm font-bold sm:text-base">تثبيت تطبيق رقيم</h3>
              <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                {isIOS
                  ? 'أضف رقيم إلى الشاشة الرئيسية للوصول السريع'
                  : 'ثبت التطبيق للحصول على تجربة أفضل وأسرع'}
              </p>
            </div>

            {isIOS ? (
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>للتثبيت:</p>
                <ol className="mr-4 list-decimal space-y-1">
                  <li>اضغط على زر المشاركة في Safari</li>
                  <li>اختر "إضافة إلى الشاشة الرئيسية"</li>
                </ol>
              </div>
            ) : (
              <Button onClick={handleInstall} size="sm" className="w-full">
                <Download className="ml-2 h-4 w-4" />
                تثبيت التطبيق
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
