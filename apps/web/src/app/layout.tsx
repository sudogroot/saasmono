import Header from '@/components/header'
import Providers from '@/components/providers'
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import '../index.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'latin-ext'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'منارة - منصة إدارة المؤسسات التعليمية',
  description: 'منصة شاملة لإدارة المؤسسات التعليمية من الروضة إلى التعليم العالي. تقنيات حديثة لتطوير التعليم وتسهيل الإدارة.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@100;200;300;400;500;600;700;800;900&family=Noto+Serif+Arabic:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
