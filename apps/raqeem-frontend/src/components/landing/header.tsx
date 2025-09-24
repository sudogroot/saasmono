"use client";

import React, { useState } from "react";
import { Button } from "@repo/ui";
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

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors" onClick={(e) => {e.preventDefault(); document.getElementById('features')?.scrollIntoView({behavior: 'smooth'});}}>الميزات</Link>
            <Link href="#showcase" className="text-gray-600 hover:text-gray-900 transition-colors" onClick={(e) => {e.preventDefault(); document.getElementById('showcase')?.scrollIntoView({behavior: 'smooth'});}}>عرض المنتج</Link>
            <Link href="#problems" className="text-gray-600 hover:text-gray-900 transition-colors" onClick={(e) => {e.preventDefault(); document.getElementById('problems')?.scrollIntoView({behavior: 'smooth'});}}>حلول المشاكل</Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors" onClick={(e) => {e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({behavior: 'smooth'});}}>الأسعار</Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Button asChild size="sm" variant="outline">
              <Link href="/login">تسجيل الدخول</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 px-6">
              <Link href="/register">إنشاء حساب</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
              <Link href="/register">إنشاء حساب</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-white py-4">
            <nav className="flex flex-col gap-4">
              <Link
                href="#features"
                className="text-gray-600 hover:text-gray-900 py-2"
                onClick={(e) => {e.preventDefault(); document.getElementById('features')?.scrollIntoView({behavior: 'smooth'}); setMobileMenuOpen(false);}}
              >
                الميزات
              </Link>
              <Link
                href="#showcase"
                className="text-gray-600 hover:text-gray-900 py-2"
                onClick={(e) => {e.preventDefault(); document.getElementById('showcase')?.scrollIntoView({behavior: 'smooth'}); setMobileMenuOpen(false);}}
              >
                عرض المنتج
              </Link>
              <Link
                href="#problems"
                className="text-gray-600 hover:text-gray-900 py-2"
                onClick={(e) => {e.preventDefault(); document.getElementById('problems')?.scrollIntoView({behavior: 'smooth'}); setMobileMenuOpen(false);}}
              >
                حلول المشاكل
              </Link>
              <Link
                href="#pricing"
                className="text-gray-600 hover:text-gray-900 py-2"
                onClick={(e) => {e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({behavior: 'smooth'}); setMobileMenuOpen(false);}}
              >
                الأسعار
              </Link>
              <div className="pt-4 border-t flex flex-col gap-3">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">تسجيل الدخول</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/register">إنشاء حساب</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}