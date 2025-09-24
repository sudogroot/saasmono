'use client';

import { authClient } from '@/lib/auth-client';
import { DashboardLayout } from '@/components/layout';
import { useRouter } from 'next/navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // Since middleware handles authentication redirects, we don't need to handle
  // authentication logic here. The middleware ensures only authenticated users
  // can access /dashboard routes.

  return <DashboardLayout>{children}</DashboardLayout>;
}
