"use client";

import React from "react";
import { Header, Footer } from "@/components/landing";
import { Button, Heading, Text } from "@/components/base";
import { Scale, Mail, Calendar, Sparkles, CheckCircle } from "lucide-react";
import Link from "next/link";

// Early Adopter Landing Page
function EarlyAdopterHero() {
  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-white to-gray-50 py-20 md:py-28 lg:py-36 overflow-hidden min-h-[calc(100vh-80px)]">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        <div className="text-center max-w-5xl mx-auto space-y-12">
          {/* Early Access Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full px-6 py-3 shadow-lg animate-pulse">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold text-sm">برنامج الوصول المبكر</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="space-y-6">
            <Heading level={1} className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.2] tracking-tight">
              مستقبل إدارة
              <br />
              <span className="bg-gradient-to-l from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                المكاتب القانونية
              </span>
            </Heading>

            <Text size="xl" className="text-gray-600 leading-relaxed max-w-3xl mx-auto text-lg md:text-2xl font-medium">
              نبني منصة متكاملة لإدارة القضايا، الجلسات، المنوبين والمستندات بذكاء وكفاءة
            </Text>
          </div>

          {/* Early Adopter Benefits */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-violet-200 p-8 md:p-10 shadow-xl max-w-3xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-center gap-3 justify-center">
                <Scale className="h-8 w-8 text-violet-600" />
                <Heading level={3} className="text-2xl font-bold text-gray-900">
                  كن من أوائل المستخدمين
                </Heading>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-right">
                {[
                  "وصول مبكر للميزات الجديدة",
                  "تأثير مباشر على تطوير المنتج",
                  "أسعار تفضيلية مدى الحياة",
                  "دعم فني مخصص وسريع",
                  "تدريب شخصي على المنصة",
                  "استشارات مجانية لتحسين العمل"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <Text className="text-gray-700 font-medium">{benefit}</Text>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button
              size="lg"
              className="text-lg px-12 py-8 shadow-2xl transform hover:scale-105 transition-all duration-300 font-bold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              asChild
            >
              <Link href="/contact">
                <Mail className="ml-2 h-5 w-5" />
                احجز عرضاً توضيحياً
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="text-lg px-12 py-8 border-2 hover:bg-gray-50 font-semibold shadow-lg border-violet-600 text-violet-600 hover:bg-violet-50"
              asChild
            >
              <Link href="/register">
                <Calendar className="ml-2 h-5 w-5" />
                سجل اهتمامك
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8">
            <Text size="sm" className="text-gray-500 mb-4">
              منصة مصممة خصيصاً للمحامين في تونس
            </Text>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-violet-600" />
                <span className="font-medium">متوافق مع القانون التونسي</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-violet-600" />
                <span className="font-medium">بيانات آمنة ومشفرة</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-violet-600" />
                <span className="font-medium">دعم باللغة العربية</span>
              </div>
            </div>
          </div>

          {/* Launch Timeline */}
          <div className="pt-12">
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-200">
              <Text className="text-violet-900 font-semibold mb-2">
                📅 الإطلاق التجريبي المخطط
              </Text>
              <Text size="lg" className="text-violet-700 font-bold">
                الربع الثاني من 2025
              </Text>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingPageContent() {
  return (
    <div className="min-h-screen" dir="rtl">
      <Header />
      <EarlyAdopterHero />
      <Footer />
    </div>
  );
}
