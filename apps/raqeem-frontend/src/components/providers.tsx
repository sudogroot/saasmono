'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/utils/orpc';
import { ThemeProvider } from './theme-provider';
import { Toaster } from './ui/sonner';
import { GlobalSheetProvider } from './base/sheet';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='light'
      // enableSystem
      // disableTransitionOnChange
      forcedTheme='light'
    >
      <QueryClientProvider client={queryClient}>
        <GlobalSheetProvider>
          {children}
          <ReactQueryDevtools />
        </GlobalSheetProvider>
      </QueryClientProvider>
      <Toaster richColors position='bottom-left' />
    </ThemeProvider>
  );
}
