import React from "react";
import { Badge, Heading, Text } from "@/components/base";
import { CheckCircle, Gavel, CalendarDays, FolderOpen, UserCheck } from "lucide-react";
import { CasesFeature, CalendarFeature, FilesFeature, ClientsFeature } from "./feature-components";

export function FeaturesShowcase() {
  return (
    <section id="showcase" className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <Badge variant="secondary" className="mb-4">عرض المنتج</Badge>
          <Heading level={2} className="mb-4 lg:mb-6">
            اكتشف كيف يغير رقيم مكتبك القانوني
          </Heading>
          <Text size="xl" className="text-gray-600 max-w-3xl mx-auto">
            تصفح الميزات التفاعلية وشاهد كيف يمكن لرقيم تحويل طريقة إدارة مكتبك القانوني
          </Text>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Scrollable Features */}
          <div className="space-y-0">

            {/* Feature 1: Cases - Preview Left, Description Right */}
            <div className="py-16 md:py-24">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="order-1">
                  <CasesFeature />
                </div>
                <div className="space-y-4 lg:space-y-6 order-2">
                  <div>
                    <Badge variant="secondary" className="mb-4">
                      <Gavel className="h-4 w-4 mr-2" />
                      إدارة القضايا
                    </Badge>
                    <Heading level={3} className="font-bold mb-3 lg:mb-4">إدارة شاملة للقضايا</Heading>
                    <Text className="text-gray-600 leading-relaxed">
                      تتبع جميع قضاياك في مكان واحد. من القضايا الجديدة إلى المكتملة،
                      مع إمكانية تصنيفها حسب النوع والحالة والأولوية.
                    </Text>
                  </div>
                  <ul className="space-y-2 lg:space-y-3">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                      <Text as="span">تصنيف تلقائي للقضايا</Text>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                      <Text as="span">تتبع المراحل والحالات</Text>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                      <Text as="span">تقارير مفصلة وإحصائيات</Text>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Feature 2: Calendar - Description Left, Preview Right */}
            <div className="bg-gray-50 py-16 md:py-24">
              <div className="container mx-auto px-4 lg:px-8">
                <div className="max-w-7xl mx-auto">
                  <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    <div className="space-y-4 lg:space-y-6 order-1">
                      <div>
                        <Badge variant="secondary" className="mb-4">
                          <CalendarDays className="h-4 w-4 mr-2" />
                          المواعيد
                        </Badge>
                        <Heading level={3} className="font-bold mb-3 lg:mb-4">جدولة ذكية للمواعيد</Heading>
                        <Text className="text-gray-600 leading-relaxed">
                          نظام تقويم متقدم لإدارة جلسات المحكمة واجتماعات العملاء
                          مع تنبيهات تلقائية وتذكيرات قبل المواعيد.
                        </Text>
                      </div>
                      <ul className="space-y-2 lg:space-y-3">
                        <li className="flex items-center gap-3">
                          <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                          <Text as="span">تنبيهات تلقائية</Text>
                        </li>
                        <li className="flex items-center gap-3">
                          <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                          <Text as="span">مزامنة مع التقويم</Text>
                        </li>
                        <li className="flex items-center gap-3">
                          <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                          <Text as="span">إدارة تعارض المواعيد</Text>
                        </li>
                      </ul>
                    </div>
                    <div className="order-2">
                      <CalendarFeature />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Files - Preview Left, Description Right */}
            <div className="py-16 md:py-24">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="order-1">
                  <FilesFeature />
                </div>
                <div className="space-y-4 lg:space-y-6 order-2">
                  <div>
                    <Badge variant="secondary" className="mb-4">
                      <FolderOpen className="h-4 w-4 mr-2" />
                      الملفات والوثائق
                    </Badge>
                    <Heading level={3} className="font-bold mb-3 lg:mb-4">إدارة آمنة للوثائق</Heading>
                    <Text className="text-gray-600 leading-relaxed">
                      حفظ وتنظيم جميع الوثائق القانونية بأمان عالي مع إمكانية
                      البحث السريع والوصول من أي مكان.
                    </Text>
                  </div>
                  <ul className="space-y-2 lg:space-y-3">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                      <Text as="span">تشفير متقدم</Text>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                      <Text as="span">بحث ذكي في المحتوى</Text>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                      <Text as="span">نسخ احتياطية تلقائية</Text>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Feature 4: Clients - Description Left, Preview Right */}
            <div className="bg-gray-50 py-16 md:py-24">
              <div className="container mx-auto px-4 lg:px-8">
                <div className="max-w-7xl mx-auto">
                  <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    <div className="space-y-4 lg:space-y-6 order-1">
                      <div>
                        <Badge variant="secondary" className="mb-4">
                          <UserCheck className="h-4 w-4 mr-2" />
                          العملاء
                        </Badge>
                        <Heading level={3} className="font-bold mb-3 lg:mb-4">قاعدة بيانات شاملة للعملاء</Heading>
                        <Text className="text-gray-600 leading-relaxed">
                          إدارة متكاملة لمعلومات العملاء مع تتبع تاريخ التعامل
                          وجميع القضايا المرتبطة بكل عميل.
                        </Text>
                      </div>
                      <ul className="space-y-2 lg:space-y-3">
                        <li className="flex items-center gap-3">
                          <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                          <Text as="span">ملفات شخصية مفصلة</Text>
                        </li>
                        <li className="flex items-center gap-3">
                          <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                          <Text as="span">تتبع التفاعلات</Text>
                        </li>
                        <li className="flex items-center gap-3">
                          <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                          <Text as="span">إدارة المراسلات</Text>
                        </li>
                      </ul>
                    </div>
                    <div className="order-2">
                      <ClientsFeature />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
