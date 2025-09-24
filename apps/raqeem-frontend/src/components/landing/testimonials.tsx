import React from "react";
import { Badge } from "@repo/ui";
import { Card, CardContent } from "@repo/ui";
import { Calendar, Search, Shield, CheckCircle } from "lucide-react";

const problemsSolved = [
  {
    icon: Calendar,
    title: "لن تفوت موعداً مرة أخرى",
    description: "تنبيهات تلقائية لجلسات المحكمة ولقاءات العملاء",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    icon: Search,
    title: "لا مزيد من البحث عن الملفات",
    description: "جميع وثائقك منظمة وقابلة للبحث في ثوانٍ",
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    icon: Shield,
    title: "بياناتك محمية دائماً",
    description: "تشفير متقدم ونسخ احتياطية آمنة",
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    icon: CheckCircle,
    title: "تتبع سهل لحالة القضايا",
    description: "رؤية واضحة لتقدم كل قضية ومرحلتها",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50"
  }
];

export function Testimonials() {
  return (
    <section id="problems" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">المشاكل التي نحلها</Badge>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            نهاية لمشاكل إدارة المكتب القانوني
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            رقيم يحل المشاكل اليومية التي تواجهها في إدارة مكتبك
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problemsSolved.map((problem, index) => (
            <Card key={index} className="bg-white hover:shadow-lg transition-all duration-300 text-center">
              <CardContent className="p-6">
                <div className={`w-12 h-12 ${problem.bgColor} rounded-lg flex items-center justify-center mb-4 mx-auto`}>
                  <problem.icon className={`h-6 w-6 ${problem.color}`} />
                </div>
                <h3 className="font-semibold text-base mb-3">{problem.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {problem.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}