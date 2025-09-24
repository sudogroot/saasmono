'use client';
import { authClient } from '@/lib/auth-client';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  // const router = useRouter();
  // const { data: session, isPending } = authClient.useSession();

  // const privateData = useQuery(orpc.privateData.queryOptions({}));

  // if (isPending) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="flex items-center space-x-2">
  //         <Loader2 className="h-6 w-6 animate-spin" />
  //         <span>جاري التحميل...</span>
  //       </div>
  //     </div>
  //   );
  // }

  return <div>Dashboard</div>;
}
