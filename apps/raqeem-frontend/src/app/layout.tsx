import Providers from '@/components/providers'
import { RegisterServiceWorker } from '@/components/pwa/register-sw'
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4001'),
  title: {
    default: 'رقيم - نظام إدارة المؤسسات القانونية',
    template: '%s | رقيم'
  },
  description: 'نظام إدارة شامل ومتطور للمكاتب القانونية ومكاتب المحاماة. إدارة القضايا، المنوبين، المواعيد، والمستندات بكفاءة عالية',
  keywords: ['نظام إدارة قانوني', 'مكاتب المحاماة', 'إدارة القضايا', 'رقيم', 'نظام قانوني'],
  authors: [{ name: 'رقيم' }],
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
    description: 'نظام إدارة شامل ومتطور للمكاتب القانونية ومكاتب المحاماة. إدارة القضايا، المنوبين، المواعيد، والمستندات بكفاءة عالية',
    url: '/',
    locale: 'ar_SA',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'رقيم - نظام إدارة المؤسسات القانونية',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'رقيم - نظام إدارة المؤسسات القانونية',
    description: 'نظام إدارة شامل ومتطور للمكاتب القانونية ومكاتب المحاماة',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
        {/* Viewport and PWA Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, viewport-fit=cover, user-scalable=yes" />
        <meta name="theme-color" content="#000000" />

        {/* PWA Capabilities */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="رقيم" />

        {/* Icons */}
        <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon/web-app-manifest-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon/web-app-manifest-512x512.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon/favicon-96x96.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <RegisterServiceWorker />
        <Providers>
          <div className="grid grid-rows-[auto_1fr] py-0">{children}</div>
        </Providers>
      </body>
    </html>
  )
}
