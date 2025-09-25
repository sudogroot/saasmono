'use client';

import { authClient } from '@/lib/auth-client';
import { RaqeemDashboardLayout } from '@repo/ui';
import { useRouter, usePathname } from 'next/navigation';
import { navigationItems, breadcrumbs, mainNavItems, quickActions, drawerItems } from '@/components/layout/config';
import { useSheetUrlSync } from '@/hooks/use-sheet-url-sync';
import { globalSheet } from '@/stores/global-sheet-store';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  // User handling functions
  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = '/';
  };

  // Quick action handlers that open forms in side sheets
  const handleNewClient = () => {
    globalSheet.openClientForm({
      mode: 'create',
      slug: 'clients',
      size: 'lg',
    });
  };

  const handleNewCase = () => {
    globalSheet.openCaseForm({
      mode: 'create',
      slug: 'cases',
      size: 'lg',
    });
  };

  const handleNewOpponent = () => {
    globalSheet.openOpponentForm({
      mode: 'create',
      slug: 'opponents',
      size: 'lg',
    });
  };

  const handleSearch = () => {
    // TODO: Implement global search functionality in a sheet
    console.log('Global search functionality coming soon...');
  };

  const handleMobileQuickAction = (action: string) => {
    switch (action) {
      case 'create-case':
        handleNewCase();
        break;
      case 'create-client':
        handleNewClient();
        break;
      case 'create-appointment':
        // TODO: Add appointment form when available
        console.log('Create appointment action');
        break;
      case 'search':
        handleSearch();
        break;
      default:
        break;
    }
  };

  const handleMobileLogout = async () => {
    await authClient.signOut();
    window.location.href = '/';
  };

  // User data
  const user = !isPending && session ? {
    name: session.user?.name || '',
    email: session.user?.email || '',
    image: session.user?.image || ''
  } : undefined;

  return (
    <RaqeemDashboardLayout
      navigationItems={navigationItems}
      breadcrumbs={breadcrumbs}
      pathname={pathname}
      user={user}
      onSignOut={handleSignOut}
      onNewClient={handleNewClient}
      onNewCase={handleNewCase}
      onNewOpponent={handleNewOpponent}
      onSearch={handleSearch}
      mobileNavItems={mainNavItems}
      mobileQuickActions={quickActions}
      mobileDrawerItems={drawerItems}
      onMobileQuickAction={handleMobileQuickAction}
      onMobileLogout={handleMobileLogout}
      mobileNotifications={{
        count: 3,
        variant: "destructive"
      }}
      useSheetUrlSync={useSheetUrlSync}
    >
      {children}
    </RaqeemDashboardLayout>
  );
}
