"use client";

import SignUpForm from "@/components/sign-up-form";

export default function RegisterPage() {
  return (
    <SignUpForm onSwitchToSignIn={() => window.location.href = '/login'} />
  );
}