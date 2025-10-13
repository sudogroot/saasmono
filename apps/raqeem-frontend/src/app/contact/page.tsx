import { Badge, Button, Card, CardContent, Heading, Text } from "@/components/base";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from "lucide-react";
import { Header, Footer } from "@/components/landing";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "اتصل بنا",
  description: "تواصل مع فريق رقيم - نحن هنا لمساعدتك في كل خطوة",
};

export default function ContactPage() {
  const contactMethods = [
    {
      icon: Mail,
      title: "البريد الإلكتروني",
      value: "contact@raqeem.tn",
      description: "راسلنا في أي وقت",
      link: "mailto:contact@raqeem.tn",
    },
    {
      icon: Phone,
      title: "الهاتف",
      value: "+216 XX XXX XXX",
      description: "من السبت إلى الخميس",
      link: "tel:+216XXXXXXXX",
    },
    {
      icon: MapPin,
      title: "العنوان",
      value: "تونس العاصمة، تونس",
      description: "المقر الرئيسي",
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
            اتصل بنا
          </Badge>
          <Heading level={1} className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            نحن هنا لمساعدتك
          </Heading>
          <Text size="xl" className="text-gray-300 max-w-3xl mx-auto leading-relaxed">
            فريقنا جاهز للإجابة على استفساراتك وتقديم الدعم الذي تحتاجه
          </Text>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {contactMethods.map((method, index) => (
              <Card key={index} className="hover:shadow-xl transition-all border-2 border-gray-200 hover:border-slate-300">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <method.icon className="h-8 w-8 text-white" />
                  </div>
                  <Heading level={3} className="text-xl font-bold mb-2">
                    {method.title}
                  </Heading>
                  {method.link ? (
                    <a
                      href={method.link}
                      className="text-slate-900 font-semibold text-lg hover:text-slate-700 transition-colors block mb-2"
                    >
                      {method.value}
                    </a>
                  ) : (
                    <Text className="text-slate-900 font-semibold mb-2">
                      {method.value}
                    </Text>
                  )}
                  <Text variant="small" className="text-gray-600">
                    {method.description}
                  </Text>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Working Hours & Response Time */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <Card className="border-2 border-slate-200 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="h-7 w-7 text-blue-600" />
                  </div>
                  <div>
                    <Heading level={3} className="text-xl font-bold mb-3">ساعات العمل</Heading>
                    <Text className="text-gray-700 mb-2">من السبت إلى الخميس</Text>
                    <Text className="text-gray-700 font-semibold">9:00 صباحاً - 6:00 مساءً</Text>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-200 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-7 w-7 text-green-600" />
                  </div>
                  <div>
                    <Heading level={3} className="text-xl font-bold mb-3">وقت الاستجابة</Heading>
                    <Text className="text-gray-700 mb-2">نرد على استفساراتك خلال</Text>
                    <Text className="text-gray-700 font-semibold">24 ساعة عمل</Text>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Card */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-2xl">
            <CardContent className="p-12">
              <div className="text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Send className="h-10 w-10 text-white" />
                </div>
                <Heading level={2} className="text-3xl md:text-4xl font-bold mb-4">
                  هل لديك سؤال؟
                </Heading>
                <Text size="lg" className="text-gray-300 mb-8 leading-relaxed">
                  فريق الدعم جاهز للإجابة على جميع استفساراتك ومساعدتك في استخدام المنصة بأفضل طريقة ممكنة
                </Text>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-white text-slate-900 hover:bg-gray-100" asChild>
                    <a href="mailto:contact@raqeem.tn">
                      راسلنا الآن
                      <Mail className="mr-2 h-5 w-5" />
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                    <Link href="/register">سجّل اهتمامك</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <Heading level={2} className="text-3xl font-bold mb-3">أسئلة شائعة</Heading>
              <Text className="text-gray-600 max-w-2xl mx-auto">
                إجابات سريعة عن الأسئلة الأكثر شيوعاً
              </Text>
            </div>
            <div className="space-y-4">
              {[
                {
                  q: "كيف يمكنني البدء في استخدام رقيم؟",
                  a: "يمكنك التسجيل مباشرة من خلال موقعنا. سنتواصل معك لإعدادك وتدريبك على استخدام المنصة."
                },
                {
                  q: "هل تقدمون دعماً فنياً؟",
                  a: "نعم، نقدم دعماً فنياً كاملاً عبر البريد الإلكتروني والهاتف خلال ساعات العمل."
                },
                {
                  q: "هل يمكنني طلب عرض توضيحي للمنصة؟",
                  a: "بالتأكيد! تواصل معنا لتحديد موعد مناسب لعرض توضيحي مخصص لاحتياجاتك."
                },
              ].map((item, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <Heading level={3} className="text-lg font-semibold text-gray-900 mb-3">
                      {item.q}
                    </Heading>
                    <Text className="text-gray-600 leading-relaxed">
                      {item.a}
                    </Text>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
