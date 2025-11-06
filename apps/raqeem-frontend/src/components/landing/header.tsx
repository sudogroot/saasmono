"use client";

import React, { useState } from "react";
import { Button } from "@/components/base";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image src="/raqeem-logo.svg" alt="Logo" width={120} height={30} />
          </div>

          {/* Desktop Actions - Simplified for Early Access */}
          <div className="hidden lg:flex items-center gap-3">
            <Button asChild size="sm" variant="outline">
              <Link href="/login">تسجيل الدخول</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 px-6">
              <Link href="/interest">سجل اهتمامك</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/login">تسجيل الدخول</Link>
            </Button>
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
              <Link href="/interest">سجل اهتمامك</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}