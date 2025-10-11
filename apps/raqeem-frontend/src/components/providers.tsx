'use client'

import { queryClient } from '@/utils/orpc'
import { Toaster } from '@repo/ui'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { GlobalSheetProvider } from './base/sheet'
import { ThemeProvider } from './theme-provider'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      // enableSystem
      // disableTransitionOnChange
      forcedTheme="light"
    >
      <QueryClientProvider client={queryClient}>
        <GlobalSheetProvider>
          {children}
          <ReactQueryDevtools />
        </GlobalSheetProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
