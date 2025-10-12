import React from "react";
import { Button, Badge, Heading, Text } from "@repo/ui";
import { Award, Scale, Gavel, Calendar, FileText, Clock, CheckCircle, TrendingUp } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="bg-gradient-to-br from-gray-50 to-white py-8 md:py-12 lg:py-16">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Main Content - Headlines and CTAs First */}
        <div className="text-center max-w-4xl mx-auto space-y-6 mb-8 lg:mb-12">
          <Badge variant="secondary" className="w-fit mx-auto">
            <Award className="h-4 w-4 mr-2" />
            المنصة الأولى في تونس
          </Badge>

          {/* Big, Bold Headline */}
          <Heading level={1} className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            إدارة مكتبك القانوني
            <br />
            <span className="text-primary">بكفاءة وسهولة</span>
          </Heading>

          {/* Functional Description */}
          <Text size="xl" className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
            نظام رقيم المتكامل لإدارة القضايا، المواعيد، الوثائق، والعملاء — كل ما تحتاجه في مكان واحد
          </Text>

          {/* Dual CTAs - Above the Fold */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              className="text-base md:text-lg px-8 py-6 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 hover:from-slate-800 hover:via-slate-600 hover:to-slate-800 text-white shadow-xl transform hover:scale-105 transition-all duration-300 font-bold"
              asChild
            >
              <Link href="/register">
                ابدأ مجاناً الآن
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="text-base md:text-lg px-8 py-6 border-2 hover:bg-gray-50 font-semibold"
              asChild
            >
              <Link href="#demo">
                شاهد العرض التوضيحي
              </Link>
            </Button>
          </div>
        </div>

        {/* Visual Preview - Below CTAs */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="bg-white rounded-xl shadow-2xl p-4 md:p-6 lg:p-8 border">
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Scale className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  </div>
                  <div>
                    <Heading level={3} className="text-base md:text-lg font-semibold">نظام رقيم</Heading>
                    <Text variant="small" className="text-gray-500 text-xs md:text-sm">منصة إدارة قانونية متكاملة</Text>
                  </div>
                </div>

                <div className="grid gap-2 md:gap-3">
                  <div className="flex justify-between items-center p-2 md:p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Gavel className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <Text as="span" className="text-xs md:text-sm">قضية تجارية - محمد التونسي</Text>
                    </div>
                    <Badge className="text-xs">جديدة</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 md:p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <Text as="span" className="text-xs md:text-sm">جلسة محكمة تونس - 10:00</Text>
                    </div>
                    <Badge variant="secondary" className="text-xs">اليوم</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 md:p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600 flex-shrink-0" />
                      <Text as="span" className="text-xs md:text-sm">تذكير: تسليم الوثائق</Text>
                    </div>
                    <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700">تذكير</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements - Smaller on mobile */}
            <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 bg-primary text-white p-2 md:p-3 rounded-full shadow-lg">
              <CheckCircle className="h-4 w-4 md:h-6 md:w-6" />
            </div>
            <div className="absolute -bottom-2 -left-2 md:-bottom-4 md:-left-4 bg-green-500 text-white p-2 md:p-3 rounded-full shadow-lg">
              <TrendingUp className="h-4 w-4 md:h-6 md:w-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
