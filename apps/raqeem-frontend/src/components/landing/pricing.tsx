import React from "react";
import { Badge, Heading, Text } from "@/components/base";
import { Button } from "@/components/base";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/base";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export function Pricing() {
  return (
    <section id="pricing" className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">الأسعار</Badge>
          <Heading level={2} className="mb-3">
            خطط تناسب احتياجاتك
          </Heading>
          <Text size="lg" className="text-gray-600">
            ابدأ مجاناً واكتشف كيف يمكن لرقيم تحويل مكتبك القانوني
          </Text>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-r from-primary to-gray-600 text-white border-0 shadow-xl">
            <CardContent className="text-center p-6">
              <div className="mb-6">
                <Heading level={3} className="font-bold mb-1">تجربة مجانية كاملة</Heading>
                <Heading level={2} className="font-bold mb-1">مجاناً</Heading>
                <Text size="sm" className="opacity-90">30 يوماً بدون قيود</Text>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <Text as="span" size="sm">جميع الميزات</Text>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <Text as="span" size="sm">دعم فني</Text>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <Text as="span" size="sm">بدون بطاقة ائتمان</Text>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <Text as="span" size="sm">إلغاء متى شئت</Text>
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
