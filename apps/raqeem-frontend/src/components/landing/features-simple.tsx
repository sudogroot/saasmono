import React from "react";
import { Badge, Heading, Text } from "@/components/base";
import { Card, CardContent } from "@/components/base";
import {
  Scale,
  Users,
  Calendar,
  FileText,
  Shield,
  Zap
} from "lucide-react";

const features = [
  {
    icon: Scale,
    title: "إدارة القضايا",
    description: "تتبع جميع قضاياك بسهولة"
  },
  {
    icon: Calendar,
    title: "جدولة المواعيد",
    description: "تنبيهات ذكية للجلسات"
  },
  {
    icon: FileText,
    title: "إدارة الوثائق",
    description: "حفظ آمن ومنظم للملفات"
  },
  {
    icon: Users,
    title: "إدارة المنوبين",
    description: "قاعدة بيانات شاملة"
  },
  {
    icon: Shield,
    title: "أمان وخصوصية",
    description: "حماية متقدمة للبيانات"
  },
  {
    icon: Zap,
    title: "سريع وسهل",
    description: "واجهة بسيطة وفعالة"
  }
];

export function FeaturesSimple() {
  return (
    <section id="features" className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-12 max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-3">الميزات</Badge>
          <Heading level={2} className="text-3xl md:text-4xl mb-4">
            كل ما تحتاجه في مكان واحد
          </Heading>
          <Text size="lg" className="text-gray-600">
            أدوات قوية لتبسيط عملك اليومي
          </Text>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-2">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <Heading level={3} className="text-lg md:text-xl mb-2">{feature.title}</Heading>
                <Text className="text-sm md:text-base text-gray-600">
                  {feature.description}
                </Text>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
