import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export function Pricing() {
  return (
    <section id="pricing" className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">الأسعار</Badge>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            خطط تناسب احتياجاتك
          </h2>
          <p className="text-lg text-gray-600">
            ابدأ مجاناً واكتشف كيف يمكن لرقيم تحويل مكتبك القانوني
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-r from-primary to-gray-600 text-white border-0 shadow-xl">
            <CardContent className="text-center p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">تجربة مجانية كاملة</h3>
                <div className="text-3xl font-bold mb-1">مجاناً</div>
                <p className="text-sm opacity-90">30 يوماً بدون قيود</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>جميع الميزات</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>دعم فني</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>بدون بطاقة ائتمان</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>إلغاء متى شئت</span>
                </div>
              </div>

              <Button size="lg" variant="secondary" className="text-base px-6 py-3 text-primary font-bold w-full" asChild>
                <Link href="/register">ابدأ التجربة المجانية</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
