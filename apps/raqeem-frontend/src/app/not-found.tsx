"use client";

import { Button } from "@/components/base";
import { Header, Footer } from "@/components/landing";
import { FileQuestion, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  // If it's a dashboard route, show dashboard 404
  if (isDashboard) {
    return <DashboardNotFoundContent />;
  }

  // Otherwise show public 404
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex flex-col" dir="rtl">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-lg border border-gray-200 shadow-md p-6 md:p-10">
            <div className="text-center">
              {/* Icon */}
              <div className="mb-6 relative inline-block">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center relative">
                  <FileQuestion className="h-10 w-10 md:h-12 md:w-12 text-slate-700" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-lg font-bold">؟</span>
                  </div>
                </div>
              </div>

              {/* 404 Badge */}
              <div className="mb-4">
                <span className="inline-block px-4 py-1.5 bg-slate-100 text-slate-900 rounded-full text-sm font-semibold">
                  404
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">
                الصفحة غير موجودة
              </h1>

              {/* Description */}
              <p className="text-gray-600 mb-6 text-sm md:text-base leading-relaxed">
                عذراً، يبدو أن هذه الصفحة قررت أخذ استراحة!<br />
                دعنا نعيدك إلى الصفحة الرئيسية.
              </p>

              {/* Primary CTA */}
              <Button size="lg" className="w-full md:w-auto md:min-w-[240px]" asChild>
                <Link href="/">
                  <Home className="ml-2 h-5 w-5" />
                  العودة إلى الصفحة الرئيسية
                </Link>
              </Button>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              إذا كنت تعتقد أن هذا خطأ، يرجى{" "}
              <Link href="/contact" className="text-slate-900 font-semibold hover:text-slate-700 transition-colors">
                التواصل معنا
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Dashboard 404 Component (used when pathname starts with /dashboard)
function DashboardNotFoundContent() {
  return (
    <div className="flex items-center justify-center px-4 py-8 md:py-16" dir="rtl">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-lg border border-gray-200 shadow-md p-6 md:p-10">
          <div className="text-center">
            {/* Icon */}
            <div className="mb-6 relative inline-block">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-50 to-slate-100 rounded-full flex items-center justify-center relative">
                <FileQuestion className="h-10 w-10 md:h-12 md:w-12 text-slate-600" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-lg font-bold">!</span>
                </div>
              </div>
            </div>

            {/* Error Code */}
            <div className="mb-4">
              <span className="inline-block px-4 py-1.5 bg-slate-100 text-slate-900 rounded-full text-sm font-semibold">
                404
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">
              الصفحة غير موجودة
            </h1>

            {/* Description */}
            <p className="text-gray-600 mb-6 text-sm md:text-base leading-relaxed">
              يبدو أن هذه الصفحة في إجازة!<br />
              دعنا نعيدك إلى لوحة التحكم.
            </p>

            {/* Primary Action */}
            <Button
              size="lg"
              className="w-full md:w-auto md:min-w-[240px]"
              asChild
            >
              <Link href="/dashboard">
                العودة إلى لوحة التحكم
              </Link>
            </Button>
          </div>
        </div>

        {/* Subtle floating elements */}
        <div className="fixed top-20 left-10 w-12 h-12 bg-yellow-200 rounded-full opacity-10 blur-xl animate-bounce hidden md:block" style={{ animationDuration: '3s' }} />
        <div className="fixed bottom-20 right-10 w-16 h-16 bg-blue-200 rounded-full opacity-10 blur-xl animate-bounce hidden md:block" style={{ animationDelay: '1s', animationDuration: '4s' }} />
      </div>
    </div>
  );
}
