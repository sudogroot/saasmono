import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Scale, Gavel, Calendar, FileText, Clock, CheckCircle, TrendingUp } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="bg-gradient-to-br from-gray-50 to-white py-12 md:py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-6 lg:space-y-8 text-center lg:text-right">
            <Badge variant="secondary" className="w-fit mx-auto lg:mx-0 ">
              <Award className="h-4 w-4 mr-2" />
              المنصة الأول في تونس
            </Badge>

            <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold text-gray-900 leading-tight">
              المنصة الشاملة للمحامين.
              تضمن لك سلاسة العمل.
            </h1>

            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              نظام رقيم المتكامل يساعدك على إدارة قضاياك و وثائقك  ومواعيدك بكفاءة عالية.
              مصمم خصيصاً للمحامين والمكاتب القانونية.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end">
              <Button 
                size="lg" 
                className="relative text-base md:text-lg px-6 md:px-8 py-4 md:py-6 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 hover:from-slate-800 hover:via-slate-600 hover:to-slate-800 text-white border-2 border-slate-600 shadow-2xl transform hover:scale-105 transition-all duration-300 ease-out hover:shadow-slate-500/50 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700 before:rounded-lg overflow-hidden font-bold" 
                asChild
              >
                <Link href="/register">
                  <span className="relative z-10 flex items-center gap-2">
                    ✨ ابدأ مجاناً الآن
                  </span>
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative order-first lg:order-last">
            <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8 border">
              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Scale className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm lg:text-base">نظام رقيم</h3>
                    <p className="text-xs lg:text-sm text-gray-500">منصة إدارة قانونية متكاملة</p>
                  </div>
                </div>

                <div className="space-y-3 lg:space-y-4">
                  <div className="flex justify-between items-center p-2 lg:p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Gavel className="h-4 w-4 text-blue-600" />
                      <span className="text-xs lg:text-sm">قضية تجارية - محمد التونسي</span>
                    </div>
                    <Badge className="text-xs">جديدة</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 lg:p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span className="text-xs lg:text-sm">جلسة محكمة تونس - 10:00</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">اليوم</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 lg:p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-xs lg:text-sm">تذكير: تسليم الوثائق - 2:00</span>
                    </div>
                    <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700">تذكير</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 lg:p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-600" />
                      <span className="text-xs lg:text-sm">مراجعة عقد العمل</span>
                    </div>
                    <Badge variant="outline" className="text-xs">قريباً</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-2 -right-2 lg:-top-4 lg:-right-4 bg-primary text-white p-2 lg:p-3 rounded-full shadow-lg">
              <CheckCircle className="h-4 w-4 lg:h-6 lg:w-6" />
            </div>
            <div className="absolute -bottom-2 -left-2 lg:-bottom-4 lg:-left-4 bg-green-500 text-white p-2 lg:p-3 rounded-full shadow-lg">
              <TrendingUp className="h-4 w-4 lg:h-6 lg:w-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
