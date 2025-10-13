"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/base";
import { ArrowUp } from "lucide-react";
import Link from "next/link";

export function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3 animate-[slideInUp_0.5s_ease-out]">
      {/* Main CTA Button - More Prominent */}
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-slate-600 via-slate-800 to-slate-600 rounded-lg blur-lg opacity-30 group-hover:opacity-50 transition duration-300 animate-pulse" />

        <Button
          size="lg"
          className="relative shadow-2xl transition-all duration-300 hover:scale-105 font-bold px-8 py-6 text-base"
          asChild
        >
          <Link href="/register" className="flex items-center gap-2">
            <span>ابدأ مجاناً الآن</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </Button>
      </div>

      {/* Scroll to Top Button */}
      <Button
        size="icon"
        variant="outline"
        className="shadow-xl hover:shadow-2xl transition-all duration-300 bg-white hover:bg-gray-50 border-2"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  );
}
