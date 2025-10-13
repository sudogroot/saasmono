import { Badge, Button, Card, CardContent, Heading, Text } from "@/components/base";
import { Users, Building2, Sparkles, ArrowRight, Lock } from "lucide-react";
import { Header, Footer } from "@/components/landing";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الأسعار",
  description: "اختر الباقة المناسبة لمكتبك القانوني - أسعار تنافسية وخطط مرنة",
};

export default function PricingPage() {
  const plans = [
    {
      name: "المحامي الفردي",
      icon: Users,
      tagline: "للمحامين المستقلين",
      features: [
        "إدارة غير محدودة للقضايا",
        "جدولة الجلسات والمواعيد",
        "إدارة الموكلين والخصوم",
        "تخزين آمن للمستندات",
        "تقارير وإحصائيات أساسية",
        "تطبيق موبايل",
      ],
    },
    {
      name: "المكتب المتنامي",
      icon: Building2,
      tagline: "للمكاتب مع فريق عمل",
      popular: true,
      features: [
        "كل مزايا الباقة الفردية",
        "حسابات متعددة للفريق",
        "إدارة الصلاحيات والأدوار",
        "تقارير وتحليلات متقدمة",
        "دعم فني مخصص وأولوية",
        "تكامل مع الأنظمة الأخرى",
        "تخزين موسع للمستندات",
      ],
    },
    {
      name: "المؤسسة القانونية",
      icon: Sparkles,
      tagline: "للمؤسسات الكبيرة",
      features: [
        "كل مزايا الباقة المتنامية",
        "عدد غير محدود من المستخدمين",
        "حلول وتقارير مخصصة",
        "تدريب شامل للفريق",
        "دعم على مدار الساعة",
        "اتفاقية مستوى خدمة (SLA)",
        "استشارة تقنية دورية",
      ],
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
            الأسعار
          </Badge>
          <Heading level={1} className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            باقات مرنة لكل<br />احتياجاتك
          </Heading>
          <Text size="xl" className="text-gray-300 max-w-3xl mx-auto leading-relaxed">
            خطط تسعير احترافية مصممة لتناسب المحامين المستقلين والمكاتب والمؤسسات القانونية
          </Text>
        </div>
      </div>

      {/* Pricing Cards - Coming Soon Style */}
      <div className="container mx-auto px-4 py-24">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative backdrop-blur-xl bg-white/60 border-2 transition-all duration-300 hover:shadow-2xl ${
                plan.popular
                  ? "border-slate-900 shadow-xl scale-105 bg-white/80"
                  : "border-gray-200 hover:border-slate-300"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-slate-900 to-slate-700 text-white px-6 py-2 shadow-lg border-0">
                    الأكثر شعبية
                  </Badge>
                </div>
              )}

              <CardContent className="p-8">
                {/* Icon and Title */}
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${
                    plan.popular
                      ? "bg-gradient-to-br from-slate-900 to-slate-700"
                      : "bg-gradient-to-br from-slate-100 to-slate-200"
                  }`}>
                    <plan.icon className={`h-8 w-8 ${plan.popular ? "text-white" : "text-slate-900"}`} />
                  </div>
                  <Heading level={3} className="text-2xl font-bold mb-2">
                    {plan.name}
                  </Heading>
                  <Text variant="small" className="text-gray-600">
                    {plan.tagline}
                  </Text>
                </div>

                {/* Blurred Price */}
                <div className="relative mb-8 py-6">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-bold bg-gradient-to-l from-slate-900 to-slate-700 bg-clip-text text-transparent blur-sm select-none">
                        000 د.ت
                      </div>
                      <Text variant="small" className="text-gray-500 blur-sm mt-1 select-none">
                        شهرياً
                      </Text>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm rounded-lg">
                    <Badge className="bg-slate-900 text-white border-0 px-4 py-2">
                      قريباً
                    </Badge>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-green-600" />
                      </div>
                      <Text size="sm" className="text-gray-700 leading-relaxed">{feature}</Text>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className="w-full"
                  disabled
                >
                  <Lock className="ml-2 h-4 w-4" />
                  سيتم الإعلان قريباً
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coming Soon Notice */}
        <div className="max-w-4xl mx-auto mb-20">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
            <CardContent className="relative p-12 text-center">
              <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <Heading level={2} className="text-3xl md:text-4xl font-bold mb-4">
                أسعار تنافسية قريباً
              </Heading>
              <Text size="lg" className="text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                نعمل على تقديم باقات مرنة بأسعار تنافسية تناسب جميع احتياجات المحامين والمكاتب القانونية. سجّل الآن للحصول على إشعار عند الإطلاق والاستفادة من العروض الخاصة!
              </Text>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-gray-100" asChild>
                  <Link href="/register">
                    سجّل اهتمامك الآن
                    <ArrowRight className="mr-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                  <Link href="/contact">تواصل معنا</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6 mb-16">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock className="h-6 w-6 text-green-600" />
            </div>
            <Text className="font-semibold mb-1">أمان تام</Text>
            <Text variant="small" className="text-gray-600">بياناتك محمية بأعلى معايير التشفير</Text>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ArrowRight className="h-6 w-6 text-blue-600" />
            </div>
            <Text className="font-semibold mb-1">سهولة الاستخدام</Text>
            <Text variant="small" className="text-gray-600">واجهة بديهية لا تحتاج تدريب مكثف</Text>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <Text className="font-semibold mb-1">دعم متواصل</Text>
            <Text variant="small" className="text-gray-600">فريقنا جاهز لمساعدتك في أي وقت</Text>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
