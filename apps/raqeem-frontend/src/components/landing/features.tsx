import React from "react";
import { Badge, Heading, Text } from "@repo/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui";
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
    description: "نظام شامل لتتبع وإدارة جميع قضاياك القانونية بسهولة ودقة"
  },
  {
    icon: Users,
    title: "إدارة العملاء",
    description: "قاعدة بيانات متكاملة لمعلومات العملاء وتاريخ التعامل معهم"
  },
  {
    icon: Calendar,
    title: "جدولة المواعيد",
    description: "تنظيم جلسات المحكمة والمواعيد مع تنبيهات ذكية"
  },
  {
    icon: FileText,
    title: "إدارة الوثائق",
    description: "حفظ وتنظيم جميع الوثائق القانونية بشكل آمن ومنظم"
  },
  {
    icon: Shield,
    title: "الأمان والخصوصية",
    description: "حماية عالية المستوى لضمان سرية المعلومات القانونية"
  },
  {
    icon: Zap,
    title: "سرعة وكفاءة",
    description: "واجهة سريعة وسهلة الاستخدام لتوفير الوقت والجهد"
  }
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">الميزات</Badge>
          <Heading level={2} className="mb-6">
            كل ما تحتاجه لإدارة مكتبك القانوني
          </Heading>
          <Text size="xl" className="text-gray-600 max-w-3xl mx-auto">
            نظام شامل ومتكامل يغطي جميع احتياجاتك اليومية في إدارة الأعمال القانونية
          </Text>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}