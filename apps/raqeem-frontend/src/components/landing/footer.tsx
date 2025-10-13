import React from "react";
import { Scale } from "lucide-react";
import Link from "next/link";
import { Heading, Text } from "@/components/base";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Scale className="h-8 w-8 text-primary" />
              <Heading level={2} className="font-bold">رقيم</Heading>
            </div>
            <Text className="text-gray-400 mb-4">
              نظام إدارة متكامل للمكاتب القانونية والمحاماة
            </Text>
          </div>

          <div>
            <Heading level={4} className="font-semibold mb-4">المنتج</Heading>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/features" className="hover:text-white transition-colors">الميزات</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">الأسعار</Link></li>
              <li><Link href="#video-demo" className="hover:text-white transition-colors">العرض التوضيحي</Link></li>
            </ul>
          </div>

          <div>
            <Heading level={4} className="font-semibold mb-4">الدعم</Heading>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/contact" className="hover:text-white transition-colors">اتصل بنا</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">ابدأ الآن</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">تسجيل الدخول</Link></li>
            </ul>
          </div>

          <div>
            <Heading level={4} className="font-semibold mb-4">الشركة</Heading>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/about" className="hover:text-white transition-colors">من نحن</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">الخصوصية</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">الشروط</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <Text>&copy; 2024 رقيم. جميع الحقوق محفوظة.</Text>
        </div>
      </div>
    </footer>
  );
}