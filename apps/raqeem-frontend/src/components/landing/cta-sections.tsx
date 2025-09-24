import React from "react";
import { Button } from "@repo/ui";
import Link from "next/link";

export function CTASection1() {
  return (
    <section className="py-16 bg-gradient-to-r from-primary to-gray-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <blockquote className="text-2xl md:text-3xl   mb-8">
            وقت أقل في الإدارة، وقت أكثر في المحاماة
          </blockquote>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-xl text-black px-8 py-6" asChild>
              <Link href="/register">ابدأ التجربة المجانية</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CTASection2() {
  return (
    <section className="py-16 bg-gray-500 text-white">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <blockquote className="text-2xl md:text-3xl mb-4">
            اعتمد علينا في التنظيم الكامل لمكتبك القانوني
          </blockquote>
          <p className="text-lg opacity-90 mb-8">
                        انضم إلى  المحامين في تونس الذين يثقون برقيم
          </p>
          <Button size="lg" variant='default' asChild className="text-xl p-6">
            <Link href="/register">انضم إلينا الآن</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function CTASection3() {
  return (
    <section className="py-16 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <blockquote className="text-2xl md:text-3xl font-light italic mb-4">
            &quot;النجاح في المحاماة يبدأ بالتنظيم الذكي&quot;
          </blockquote>
          <p className="text-lg opacity-90 mb-8">لا تدع الفوضى تؤثر على عملك القانوني</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <Link href="/register">جرب رقيم مجاناً</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
