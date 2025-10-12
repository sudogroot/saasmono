"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@repo/ui";
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
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3">
      {/* Main CTA Button */}
      <Button
        size="lg"
        className="shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 hover:from-slate-800 hover:via-slate-600 hover:to-slate-800 text-white font-bold px-6 py-3"
        asChild
      >
        <Link href="/register">
          ابدأ مجاناً
        </Link>
      </Button>

      {/* Scroll to Top Button */}
      <Button
        size="sm"
        variant="outline"
        className="shadow-lg hover:shadow-xl transition-all duration-300 bg-white hover:bg-gray-50"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
    </div>
  );
}
