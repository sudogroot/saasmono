"use client";

import React from "react";
import { Header, Footer } from "@/components/landing";
import { Button, Heading, Text } from "@/components/base";
import { Scale, Mail, Calendar, Sparkles, CheckCircle } from "lucide-react";
import Link from "next/link";

// Early Adopter Landing Page
function EarlyAdopterHero() {
  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-white to-gray-50 overflow-hidden h-[calc(100vh-80px)] flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="container mx-auto px-4 lg:px-8 relative w-full">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Early Access Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-full px-5 py-2 shadow-lg animate-pulse">
              <Sparkles className="h-4 w-4" />
              <span className="font-semibold text-xs">برنامج الوصول المبكر</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="space-y-3">
            <Heading level={1} className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
              <span className="bg-gradient-to-l from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
                منصة المحامي
              </span>
              <br />
              لإدارة مكتبه بكفاءة
            </Heading>

            <Text className="text-gray-600 leading-relaxed max-w-2xl mx-auto text-base md:text-lg">
              نبني منصة متكاملة لإدارة القضايا، الجلسات، المنوبين والمستندات بذكاء وكفاءة
            </Text>
          </div>

          {/* Early Adopter Benefits - Compact */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border-2 border-slate-200 p-6 shadow-xl max-w-2xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-2 justify-center">
                <Scale className="h-6 w-6 text-primary" />
                <Heading level={3} className="text-lg font-bold text-gray-900">
                  كن من أوائل المستخدمين
                </Heading>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-right">
                {[
                  "وصول مبكر للميزات",
                  "مزايا حصرية للمستخدمين الأوائل",
                  "دعم فني مخصص",
                  "تدريب شخصي"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <Text className="text-gray-700 text-sm">{benefit}</Text>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Buttons - Compact */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              size="default"
              className="shadow-xl transform hover:scale-105 transition-all duration-300 font-bold"
              asChild
            >
              <Link href="/interest">
                <Mail className="ml-2 h-4 w-4" />
                احجز عرضاً توضيحياً
              </Link>
            </Button>

            <Button
              size="default"
              variant="outline"
              className="border-2 hover:bg-gray-50 font-semibold shadow-lg"
              asChild
            >
              <Link href="/interest">
                <Calendar className="ml-2 h-4 w-4" />
                سجل اهتمامك
              </Link>
            </Button>
          </div>

          {/* Trust Indicators - Compact */}
          <div className="pt-4">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>مصمم للمحامين التونسيين</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>أمان وخصوصية تامة</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>واجهة عربية بالكامل</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingPageContent() {
  return (
    <div className="h-screen overflow-hidden" dir="rtl">
      <Header />
      <EarlyAdopterHero />
    </div>
  );
}
