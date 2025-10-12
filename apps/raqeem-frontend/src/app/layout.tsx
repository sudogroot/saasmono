import Providers from '@/components/providers'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '../index.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'),
  title: 'رقيم - نظام إدارة المؤسسات',
  description: 'نظام إدارة شامل للمكاتب القانونية والمحاماة',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'رقيم',
    startupImage: ['/icons/icon-192x192.svg'],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'رقيم',
    title: 'رقيم - نظام إدارة المؤسسات القانونية',
    description: 'نظام إدارة شامل للمكاتب القانونية والمحاماة',
  },
  twitter: {
    card: 'summary',
    title: 'رقيم - نظام إدارة المؤسسات القانونية',
    description: 'نظام إدارة شامل للمكاتب القانونية والمحاماة',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="رقيم" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/icons/icon-192x192.svg" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/icons/icon-192x192.svg" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <div className="grid grid-rows-[auto_1fr] py-0">{children}</div>
        </Providers>
      </body>
    </html>
  )
}
