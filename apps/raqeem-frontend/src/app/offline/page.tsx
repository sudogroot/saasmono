'use client'

import { Button, Card, Text } from '@repo/ui'
import { WifiOff } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md text-center">
        <div className="space-y-6 p-8">
          <div className="flex justify-center">
            <div className="bg-muted flex h-20 w-20 items-center justify-center rounded-full">
              <WifiOff className="text-muted-foreground h-10 w-10" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">لا يوجد اتصال بالإنترنت</h1>
            <Text variant="muted" className="text-sm">
              يبدو أنك غير متصل بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى.
            </Text>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
            >
              إعادة المحاولة
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full"
            >
              <Link href="/dashboard">العودة للوحة التحكم</Link>
            </Button>
          </div>

          <Text size="xs" variant="muted" className="mt-4">
            بعض الميزات قد لا تعمل بدون اتصال بالإنترنت
          </Text>
        </div>
      </Card>
    </div>
  )
}
