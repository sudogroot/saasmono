import React from "react";
import { Button, Badge, Heading, Text } from "@/components/base";
import { Award, Scale, Gavel, CheckCircle } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-white to-gray-50 py-16 md:py-20 lg:py-28 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        {/* Main Content - Headlines and CTAs First */}
        <div className="text-center max-w-5xl mx-auto space-y-8 mb-16 lg:mb-20">
          <Badge variant="secondary" className="w-fit mx-auto text-sm px-4 py-2 shadow-sm">
            <Award className="h-4 w-4 mr-2" />
            المنصة الأولى في تونس لإدارة المكاتب القانونية
          </Badge>

          {/* Big, Bold Headline - Above the Fold */}
          <div className="space-y-4">
            <Heading level={1} className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.3] tracking-tight">
              منصة المحامي
              <br />
              <span className="bg-gradient-to-l from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
                لإدارة مكتبه بكفاءة
              </span>
            </Heading>

            {/* Functional Description */}
            <Text size="xl" className="text-gray-600 leading-relaxed max-w-3xl mx-auto text-lg md:text-xl font-medium">
              منصة متكاملة لإدارة القضايا، الجلسات، الموكلين، والمستندات — كل ما يحتاجه محاميك في مكان واحد
            </Text>
          </div>

          {/* Dual CTAs - Prominent and Above the Fold */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button
              size="lg"
              className="text-lg px-10 py-7 shadow-2xl transform hover:scale-105 transition-all duration-300 font-bold"
              asChild
            >
              <Link href="/register">
                ابدأ مجاناً — تجربة 14 يوم
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="text-lg px-10 py-7 border-2 hover:bg-gray-50 font-semibold shadow-lg"
              asChild
            >
              <Link href="#video-demo">
                <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                شاهد العرض التوضيحي
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>بدون بطاقة ائتمان</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>إعداد في دقائق</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>دعم فني على مدار الساعة</span>
            </div>
          </div>
        </div>

        {/* Visual Preview - Matching Real Dashboard */}
        <div className="max-w-6xl mx-auto relative">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-400/10 via-slate-300/10 to-slate-400/10 blur-2xl rounded-2xl" />

          <div className="relative">
            {/* Main Dashboard Preview - Simplified */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
              {/* Browser-like Header */}
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-3 border-b border-gray-200 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white/80 rounded-lg px-6 py-1.5 text-xs text-gray-500 flex items-center gap-2">
                    <Scale className="h-3 w-3" />
                    <span>raqeem.tn/dashboard</span>
                  </div>
                </div>
              </div>

              {/* Content Area - Matching Real Dashboard Design */}
              <div className="p-6 md:p-8 space-y-4 bg-background">
                {/* Section Header - Like Real Dashboard */}
                <div className="flex items-center justify-between">
                  <Text className="text-base font-semibold">جلسات اليوم</Text>
                  <Text variant="small" className="text-muted-foreground">2</Text>
                </div>

                {/* Trial Cards - Exact Match to Real Dashboard */}
                <div className="space-y-2">
                  {/* Trial Card 1 - With all important details */}
                  <div className="group flex cursor-pointer items-start justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 border-l-4 border-l-destructive">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="space-y-1">
                        <Text weight="medium" className="line-clamp-1 text-sm">
                          قضية تجارية - شركة النور للتجارة
                        </Text>
                        <div className="flex flex-wrap items-center gap-2">
                          <Text size="xs" variant="muted" className="font-mono">
                            #2847
                          </Text>
                          <Badge variant="default" className="text-xs">
                            نشطة
                          </Badge>
                          <Badge variant="destructive" className="text-xs">
                            عاجلة
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>محكمة تونس</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>اليوم</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>10:00</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trial Card 2 */}
                  <div className="group flex cursor-pointer items-start justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="space-y-1">
                        <Text weight="medium" className="line-clamp-1 text-sm">
                          قضية عقارية - نزاع ملكية
                        </Text>
                        <div className="flex flex-wrap items-center gap-2">
                          <Text size="xs" variant="muted" className="font-mono">
                            #2846
                          </Text>
                          <Badge variant="secondary" className="text-xs">
                            قيد المراجعة
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>محكمة سوسة</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>اليوم</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>14:30</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reminders Section */}
                <div className="pt-2 space-y-2">
                  {/* File Submission Reminder */}
                  <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-950/20 p-3">
                    <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-1.5">
                      <svg className="h-4 w-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <Text className="text-sm font-medium text-orange-900 dark:text-orange-100">
                        تذكير: تسليم الوثائق
                      </Text>
                      <Text size="xs" className="text-orange-700 dark:text-orange-300">
                        قضية #2847 • باقي يومين
                      </Text>
                    </div>
                  </div>

                  {/* Note Reminder */}
                  <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 p-3">
                    <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-1.5">
                      <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <Text className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        ملاحظة: مراجعة العقد
                      </Text>
                      <Text size="xs" className="text-blue-700 dark:text-blue-300">
                        قضية #2846 • غداً 9:00 ص
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Success Badge - Subtle */}
            <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 md:p-4 rounded-xl shadow-lg">
                <CheckCircle className="h-6 w-6 md:h-7 md:w-7 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
