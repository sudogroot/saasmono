import { Badge, Card, CardContent, Heading, Text } from "@/components/base";
import { Header, Footer } from "@/components/landing";
import { Shield, FileCheck, AlertCircle, Scale } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "شروط الاستخدام",
  description: "شروط وأحكام استخدام منصة رقيم لإدارة المكاتب القانونية",
};

export default function TermsPage() {
  const sections = [
    {
      icon: FileCheck,
      title: "1. قبول الشروط والأحكام",
      content: [
        "باستخدامك لمنصة رقيم، فإنك توافق على الالتزام بهذه الشروط والأحكام وجميع القوانين واللوائح المعمول بها.",
        "إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام الخدمة.",
        "نحتفظ بالحق في تعديل هذه الشروط في أي وقت، وسيتم إشعارك بأي تغييرات جوهرية."
      ]
    },
    {
      icon: Shield,
      title: "2. استخدام الخدمة",
      content: [
        "توافق على استخدام المنصة للأغراض المهنية القانونية المشروعة فقط.",
        "يمنع استخدام المنصة بأي طريقة قد تضر بالخدمة أو تعطلها أو تعيق استخدام الآخرين لها.",
        "يجب عليك الامتثال لجميع القوانين المحلية والوطنية والدولية المعمول بها عند استخدام الخدمة.",
        "يحظر محاولة الوصول غير المصرح به إلى أي جزء من المنصة أو أنظمتها."
      ]
    },
    {
      icon: AlertCircle,
      title: "3. الحساب والمسؤولية",
      content: [
        "أنت مسؤول مسؤولية كاملة عن الحفاظ على سرية معلومات حسابك، بما في ذلك كلمة المرور.",
        "أنت مسؤول عن جميع الأنشطة التي تحدث من خلال حسابك.",
        "يجب عليك إخطارنا فوراً بأي استخدام غير مصرح به لحسابك.",
        "يجب أن تكون المعلومات التي تقدمها عند التسجيل دقيقة وكاملة ومحدثة."
      ]
    },
    {
      icon: Scale,
      title: "4. الملكية الفكرية",
      content: [
        "جميع حقوق الملكية الفكرية في المنصة ومحتواها محفوظة لشركة رقيم.",
        "لا يحق لك نسخ أو تعديل أو توزيع أو بيع أو تأجير أي جزء من الخدمة أو البرمجيات دون إذن كتابي صريح.",
        "البيانات التي تدخلها في المنصة تبقى ملكاً لك، ونحن نحترم خصوصيتها وفقاً لسياسة الخصوصية.",
        "تمنحنا ترخيصاً محدوداً لاستخدام بياناتك فقط لتقديم الخدمة لك."
      ]
    },
    {
      icon: FileCheck,
      title: "5. الرسوم والدفع",
      content: [
        "تخضع بعض خدمات المنصة لرسوم اشتراك وفقاً للخطة التي تختارها.",
        "جميع الرسوم غير قابلة للاسترداد ما لم ينص صراحة على خلاف ذلك.",
        "نحتفظ بالحق في تعديل هيكل التسعير مع إشعار مسبق.",
        "أنت مسؤول عن دفع جميع الضرائب المطبقة على استخدامك للخدمة."
      ]
    },
    {
      icon: AlertCircle,
      title: "6. إنهاء الخدمة",
      content: [
        "نحتفظ بالحق في تعليق أو إنهاء وصولك إلى الخدمة في حالة انتهاك هذه الشروط.",
        "يمكنك إلغاء حسابك في أي وقت من خلال إعدادات الحساب.",
        "عند إنهاء الحساب، سيتم حذف بياناتك وفقاً لسياسة الاحتفاظ بالبيانات الخاصة بنا.",
        "بعض الأحكام في هذه الاتفاقية ستظل سارية بعد الإنهاء."
      ]
    },
    {
      icon: Shield,
      title: "7. إخلاء المسؤولية",
      content: [
        "تُقدم الخدمة \"كما هي\" دون أي ضمانات صريحة أو ضمنية.",
        "لا نضمن أن الخدمة ستكون خالية من الأخطاء أو متاحة دون انقطاع.",
        "أنت مسؤول عن اتخاذ الاحتياطات اللازمة لحماية بياناتك.",
        "لا نتحمل المسؤولية عن أي خسارة أو ضرر ناتج عن استخدامك للخدمة."
      ]
    },
    {
      icon: Scale,
      title: "8. القانون الحاكم",
      content: [
        "تخضع هذه الشروط والأحكام لقوانين الجمهورية التونسية وتُفسر وفقاً لها.",
        "أي نزاع ينشأ عن هذه الشروط يخضع للاختصاص الحصري للمحاكم التونسية.",
        "في حالة تعارض أي من هذه الشروط مع القوانين المحلية، تسري القوانين المحلية."
      ]
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
            الشروط القانونية
          </Badge>
          <Heading level={1} className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            شروط الاستخدام
          </Heading>
          <Text size="xl" className="text-gray-300 max-w-3xl mx-auto leading-relaxed">
            الشروط والأحكام التي تحكم استخدامك لمنصة رقيم
          </Text>
        </div>
      </div>

      {/* Terms Content */}
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <Card className="mb-12 border-2 border-slate-900 shadow-xl">
            <CardContent className="p-8">
              <Text className="text-gray-700 leading-relaxed">
                يرجى قراءة هذه الشروط والأحكام بعناية قبل استخدام منصة رقيم. هذه الوثيقة تشكل اتفاقية ملزمة قانونياً بينك وبين شركة رقيم. استخدامك للمنصة يعني موافقتك الكاملة على جميع الشروط الواردة أدناه.
              </Text>
            </CardContent>
          </Card>

          {/* Terms Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border border-gray-200">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <section.icon className="h-6 w-6 text-slate-900" />
                    </div>
                    <Heading level={2} className="text-xl font-bold text-gray-900 mt-2">
                      {section.title}
                    </Heading>
                  </div>
                  <div className="space-y-3 mr-16">
                    {section.content.map((paragraph, pIndex) => (
                      <Text key={pIndex} className="text-gray-700 leading-relaxed">
                        • {paragraph}
                      </Text>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Section */}
          <Card className="mt-12 bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-dashed border-slate-300">
            <CardContent className="p-8 text-center">
              <Heading level={3} className="text-xl font-bold mb-3">
                هل لديك استفسار حول الشروط؟
              </Heading>
              <Text className="text-gray-600 mb-4">
                إذا كان لديك أي أسئلة حول شروط الاستخدام، يرجى التواصل معنا
              </Text>
              <a
                href="mailto:legal@raqeem.tn"
                className="text-slate-900 font-semibold hover:text-slate-700 transition-colors"
              >
                legal@raqeem.tn
              </a>
            </CardContent>
          </Card>

          {/* Last Updated */}
          <div className="mt-8 text-center">
            <Text variant="small" className="text-gray-500">
              آخر تحديث: يناير 2025 • ساري المفعول من تاريخ النشر
            </Text>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
