"use client";

import SignInForm from "@/components/sign-in-form";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "@/components/loader";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (session?.user && !isPending) {
      router.push('/dashboard');
    }
  }, [session, isPending, router]);

  // Show loader while checking session
  if (isPending) {
    return <Loader />;
  }

  // If user is logged in, show loader while redirecting
  if (session?.user) {
    return <Loader />;
  }

  return (
    <SignInForm onSwitchToSignUp={() => window.location.href = '/register'} />
  );
}
