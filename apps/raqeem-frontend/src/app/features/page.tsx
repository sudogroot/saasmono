import { Badge, Button, Card, CardContent, Heading, Text } from "@/components/base";
import { Scale, Calendar, Users, FileText, Bell, BarChart3, Shield, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import { Header, Footer } from "@/components/landing";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الميزات",
  description: "اكتشف جميع ميزات منصة رقيم لإدارة المكاتب القانونية",
};

export default function FeaturesPage() {
  const features = [
    {
      icon: Scale,
      title: "إدارة القضايا",
      description: "نظّم وتابع جميع قضاياك في مكان واحد مع كافة التفاصيل والمستندات القانونية",
      benefits: ["تصنيف القضايا حسب النوع والحالة", "ربط القضايا بالمنوبون والمستندات", "متابعة تطورات القضية بسهولة"],
    },
    {
      icon: Calendar,
      title: "جدولة الجلسات",
      description: "احتفظ بجدول منظم لجميع جلساتك المحكمية مع تذكيرات تلقائية",
      benefits: ["تقويم شامل لجميع المواعيد", "تذكيرات مسبقة بالجلسات", "ربط الجلسات بالقضايا"],
    },
    {
      icon: Users,
      title: "إدارة المنوبون",
      description: "احفظ معلومات منوبيك والخصوم مع سجل كامل للتعاملات والمراسلات",
      benefits: ["قاعدة بيانات شاملة للمنوبين", "سجل كامل للتواصل", "إدارة المستندات الخاصة"],
    },
    {
      icon: FileText,
      title: "إدارة المستندات",
      description: "خزّن وصنّف جميع المستندات والملفات القانونية بشكل آمن ومنظم",
      benefits: ["تخزين آمن ومشفر", "بحث سريع في المستندات", "تصنيف تلقائي"],
    },
    {
      icon: Bell,
      title: "التذكيرات الذكية",
      description: "لن تفوتك أي موعد مهم مع نظام التذكيرات والإشعارات الذكي",
      benefits: ["تذكيرات بالجلسات والمواعيد", "إشعارات بالمهام العاجلة", "تنبيهات التسليمات"],
    },
    {
      icon: BarChart3,
      title: "التقارير والإحصائيات",
      description: "احصل على رؤى واضحة حول أداء مكتبك من خلال تقارير مفصلة واحترافية",
      benefits: ["تقارير أداء شاملة", "إحصائيات القضايا", "تحليل الإنتاجية"],
    },
    {
      icon: Shield,
      title: "الأمان والخصوصية",
      description: "حماية متقدمة لبياناتك مع تشفير من الدرجة البنكية وصلاحيات مدروسة",
      benefits: ["تشفير من الدرجة البنكية", "نسخ احتياطي تلقائي", "صلاحيات متقدمة"],
    },
    {
      icon: Zap,
      title: "أداء سريع وموثوق",
      description: "واجهة سريعة ومستجيبة لتوفير وقتك الثمين مع أداء عالٍ وموثوقية تامة",
      benefits: ["واجهة سريعة وسلسة", "عمل بدون اتصال", "تحديثات تلقائية"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50" dir="rtl">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.05),transparent_50%)]" />
        <div className="container mx-auto px-4 text-center relative">
          <Badge variant="secondary" className="mb-6 bg-white/10 text-white border-white/20 px-6 py-2">
            الميزات
          </Badge>
          <Heading level={1} className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            كل ما تحتاجه لإدارة<br />مكتبك القانوني
          </Heading>
          <Text size="xl" className="text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            منصة متكاملة مصممة خصيصاً لتلبية احتياجات المحامين والمكاتب القانونية في تونس
          </Text>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-slate-900 hover:bg-gray-100" asChild>
              <Link href="/register">ابدأ الآن مجاناً</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
              <Link href="/pricing">اطلع على الأسعار</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-slate-300">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <Heading level={3} className="text-2xl font-bold mb-3 text-gray-900">
                        {feature.title}
                      </Heading>
                      <Text className="text-gray-600 mb-4 leading-relaxed">
                        {feature.description}
                      </Text>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <Text size="sm" className="text-gray-700">{benefit}</Text>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-20">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-2xl">
            <CardContent className="p-12 text-center">
              <Heading level={2} className="text-3xl md:text-4xl font-bold mb-4">
                جاهز للبدء؟
              </Heading>
              <Text size="lg" className="text-gray-300 mb-8 max-w-2xl mx-auto">
                انضم إلى المحامين الذين يستخدمون رقيم لإدارة مكاتبهم بكفاءة واحترافية
              </Text>
              <Button size="lg" className="bg-white text-slate-900 hover:bg-gray-100" asChild>
                <Link href="/register">
                  ابدأ تجربتك المجانية
                  <ArrowRight className="mr-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
