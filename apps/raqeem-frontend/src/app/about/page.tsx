import { Badge, Button, Card, CardContent, Heading, Text } from "@/components/base";
import { Target, Users, Shield, Award, Heart, Lightbulb, ArrowRight } from "lucide-react";
import { Header, Footer } from "@/components/landing";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "من نحن",
  description: "تعرّف على رقيم - منصة إدارة المكاتب القانونية الاحترافية في تونس",
};

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: "الاحترافية",
      description: "نلتزم بأعلى معايير الجودة والاحترافية في كل ما نقدمه",
    },
    {
      icon: Heart,
      title: "الموثوقية",
      description: "نبني علاقات طويلة الأمد مع عملائنا قائمة على الثقة والشفافية",
    },
    {
      icon: Lightbulb,
      title: "الابتكار",
      description: "نطور حلولاً مبتكرة تواكب احتياجات المهنة القانونية المتطورة",
    },
    {
      icon: Users,
      title: "التركيز على العميل",
      description: "نضع احتياجات عملائنا في صميم كل قرار نتخذه",
    },
    {
      icon: Award,
      title: "التميز",
      description: "نسعى للتميز والتحسين المستمر في خدماتنا ومنتجاتنا",
    },
    {
      icon: Target,
      title: "الالتزام",
      description: "ملتزمون بمساعدة المحامين على تحقيق أهدافهم المهنية",
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
            من نحن
          </Badge>
          <Heading level={1} className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            شريكك الموثوق<br />لإدارة مكتبك القانوني
          </Heading>
          <Text size="xl" className="text-gray-300 max-w-3xl mx-auto leading-relaxed">
            رقيم منصة تونسية احترافية مصممة لتمكين المحامين والمكاتب القانونية من إدارة أعمالهم بكفاءة وفعالية
          </Text>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <Card className="border-2 border-slate-900 shadow-xl">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <Heading level={2} className="text-2xl font-bold mb-4">رؤيتنا</Heading>
                <Text className="text-gray-700 leading-relaxed">
                  أن نكون المنصة الرائدة في مجال إدارة المكاتب القانونية في تونس والمنطقة العربية، من خلال توفير حلول تقنية مبتكرة تساهم في رفع كفاءة وفعالية العمل القانوني.
                </Text>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-200 hover:border-slate-300 transition-colors shadow-lg">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-6 shadow-md">
                  <Award className="h-8 w-8 text-slate-900" />
                </div>
                <Heading level={2} className="text-2xl font-bold mb-4">مهمتنا</Heading>
                <Text className="text-gray-700 leading-relaxed">
                  تمكين المحامين والمكاتب القانونية من التركيز على صميم عملهم القانوني، من خلال توفير منصة شاملة وسهلة الاستخدام تدير جميع جوانب العمل الإداري بكفاءة واحترافية.
                </Text>
              </CardContent>
            </Card>
          </div>

          {/* Story */}
          <Card className="mb-20 shadow-lg">
            <CardContent className="p-10">
              <div className="text-center mb-8">
                <Heading level={2} className="text-3xl font-bold mb-3">قصتنا</Heading>
                <div className="w-20 h-1 bg-gradient-to-r from-slate-900 to-slate-700 mx-auto rounded-full" />
              </div>
              <div className="space-y-6 text-gray-700 leading-relaxed max-w-3xl mx-auto">
                <Text>
                  انطلقت فكرة رقيم من احتياج حقيقي لاحظناه في السوق التونسي: الحاجة إلى أداة حديثة وموثوقة تساعد المحامين على إدارة مكاتبهم بشكل احترافي ومنظم.
                </Text>
                <Text>
                  فريقنا المتخصص في التكنولوجيا القانونية يجمع بين الخبرة التقنية والفهم العميق لاحتياجات المهنة القانونية. نعمل عن كثب مع المحامين لتطوير حلول عملية تلبي احتياجاتهم اليومية وتساهم في نمو مكاتبهم.
                </Text>
                <Text>
                  نؤمن بأن التكنولوجيا يجب أن تكون في خدمة المحامي، لا العكس. لذلك، نحرص على تصميم منصة بديهية وسهلة الاستخدام، مع الحفاظ على قوة الميزات واحترافية الأداء. هدفنا هو أن نكون شريكاً موثوقاً في نجاح كل محامٍ ومكتب قانوني يستخدم رقيم.
                </Text>
              </div>
            </CardContent>
          </Card>

          {/* Values */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <Heading level={2} className="text-3xl font-bold mb-3">قيمنا</Heading>
              <Text className="text-gray-600 max-w-2xl mx-auto">
                القيم التي تحرك عملنا وتوجه قراراتنا
              </Text>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                      <value.icon className="h-6 w-6 text-slate-900" />
                    </div>
                    <Heading level={3} className="text-lg font-bold mb-2">
                      {value.title}
                    </Heading>
                    <Text variant="small" className="text-gray-600 leading-relaxed">
                      {value.description}
                    </Text>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-2xl">
            <CardContent className="p-12 text-center">
              <Heading level={2} className="text-3xl md:text-4xl font-bold mb-4">
                انضم إلى رقيم اليوم
              </Heading>
              <Text size="lg" className="text-gray-300 mb-8 max-w-2xl mx-auto">
                كن جزءاً من مجتمع المحامين الذين يديرون مكاتبهم بكفاءة واحترافية
              </Text>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-gray-100" asChild>
                  <Link href="/register">
                    ابدأ الآن
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
      </div>

      <Footer />
    </div>
  );
}
