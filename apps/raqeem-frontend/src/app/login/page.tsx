"use client";

import SignInForm from "@/components/sign-in-form";

export default function LoginPage() {
  return (
    <SignInForm onSwitchToSignUp={() => window.location.href = '/register'} />
  );
}
