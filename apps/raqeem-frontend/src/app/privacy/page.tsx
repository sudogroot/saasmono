import { Badge, Card, CardContent, Heading, Text } from "@/components/base";
import { Header, Footer } from "@/components/landing";
import { Shield, Lock, Eye, Share2, UserCheck, Database, Bell } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description: "سياسة الخصوصية وحماية البيانات في منصة رقيم - التزامنا بحماية معلوماتك",
};

export default function PrivacyPage() {
  const sections = [
    {
      icon: Database,
      title: "1. المعلومات التي نجمعها",
      content: [
        "المعلومات الشخصية: الاسم، البريد الإلكتروني، رقم الهاتف، ومعلومات المكتب القانوني.",
        "معلومات الحساب: اسم المستخدم، كلمة المرور المشفرة، وإعدادات الحساب.",
        "بيانات الاستخدام: كيفية استخدامك للمنصة، الميزات المستخدمة، والتفاعلات.",
        "البيانات القانونية: المعلومات التي تدخلها في المنصة مثل القضايا والموكلين والمستندات.",
        "المعلومات التقنية: عنوان IP، نوع المتصفح، ونظام التشغيل."
      ]
    },
    {
      icon: Eye,
      title: "2. كيفية استخدام المعلومات",
      content: [
        "تقديم الخدمة: لتمكينك من استخدام جميع ميزات المنصة بكفاءة.",
        "تحسين الخدمة: لتطوير وتحسين المنصة بناءً على احتياجاتك.",
        "التواصل معك: لإرسال الإشعارات المهمة والتحديثات والدعم الفني.",
        "الأمان: لحماية حسابك وكشف الأنشطة المشبوهة ومنع الاحتيال.",
        "الامتثال القانوني: للوفاء بالتزاماتنا القانونية والتنظيمية."
      ]
    },
    {
      icon: Lock,
      title: "3. حماية البيانات والأمان",
      content: [
        "تشفير البيانات: نستخدم تشفير SSL/TLS لحماية البيانات أثناء النقل وتشفير AES-256 للتخزين.",
        "الوصول المحدود: الوصول إلى بياناتك مقتصر على الموظفين المصرح لهم فقط.",
        "المراقبة الأمنية: نراقب أنظمتنا باستمرار لاكتشاف ومنع التهديدات الأمنية.",
        "النسخ الاحتياطي: نقوم بنسخ احتياطي منتظم لبياناتك لضمان استعادتها في حالات الطوارئ.",
        "التحديثات الأمنية: نحدث أنظمتنا بانتظام لحمايتها من الثغرات الأمنية."
      ]
    },
    {
      icon: Share2,
      title: "4. مشاركة المعلومات",
      content: [
        "لا نبيع بياناتك: نحن لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة مطلقاً.",
        "مقدمو الخدمات: قد نشارك معلومات محدودة مع مزودي خدمات موثوقين (مثل استضافة السحابة) الذين يساعدوننا في تشغيل المنصة.",
        "الامتثال القانوني: قد نكشف عن معلومات إذا طلب القانون ذلك أو للرد على إجراءات قانونية.",
        "بموافقتك: قد نشارك معلومات عندما تمنحنا إذناً صريحاً للقيام بذلك.",
        "المعلومات المجمعة: قد نشارك بيانات إحصائية مجمعة لا تحدد هويتك الشخصية."
      ]
    },
    {
      icon: UserCheck,
      title: "5. حقوقك في البيانات",
      content: [
        "الوصول: يمكنك الوصول إلى جميع بياناتك الشخصية من خلال إعدادات الحساب.",
        "التصحيح: يمكنك تحديث وتصحيح معلوماتك في أي وقت.",
        "الحذف: يمكنك طلب حذف حسابك وجميع بياناتك المرتبطة به.",
        "النقل: يمكنك تصدير بياناتك بصيغ قابلة للقراءة.",
        "الاعتراض: يمكنك الاعتراض على معالجة معينة لبياناتك.",
        "السحب: يمكنك سحب موافقتك على معالجة بياناتك في أي وقت."
      ]
    },
    {
      icon: Bell,
      title: "6. ملفات تعريف الارتباط (Cookies)",
      content: [
        "نستخدم ملفات تعريف الارتباط الضرورية لتشغيل المنصة بشكل صحيح.",
        "ملفات تعريف الارتباط التحليلية تساعدنا على فهم كيفية استخدامك للمنصة.",
        "يمكنك التحكم في إعدادات ملفات تعريف الارتباط من خلال متصفحك.",
        "لا نستخدم ملفات تعريف ارتباط الطرف الثالث للإعلانات."
      ]
    },
    {
      icon: Shield,
      title: "7. الاحتفاظ بالبيانات",
      content: [
        "نحتفظ ببياناتك طالما كان حسابك نشطاً.",
        "بعد حذف الحساب، نحذف بياناتك خلال 30 يوماً، باستثناء ما يتطلبه القانون.",
        "قد نحتفظ ببعض البيانات المجمعة غير المحددة للهوية لأغراض إحصائية.",
        "يمكنك طلب حذف فوري لبياناتك عن طريق التواصل معنا."
      ]
    },
    {
      icon: Database,
      title: "8. التغييرات على سياسة الخصوصية",
      content: [
        "قد نحدث هذه السياسة من وقت لآخر لتعكس التغييرات في ممارساتنا أو لأسباب تشغيلية أو قانونية.",
        "سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار على المنصة.",
        "استمرارك في استخدام المنصة بعد التغييرات يعني موافقتك على السياسة المحدثة.",
        "ننصحك بمراجعة هذه الصفحة بانتظام للبقاء على اطلاع بممارساتنا."
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
            الخصوصية والأمان
          </Badge>
          <Heading level={1} className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            سياسة الخصوصية
          </Heading>
          <Text size="xl" className="text-gray-300 max-w-3xl mx-auto leading-relaxed">
            التزامنا بحماية خصوصيتك وأمان بياناتك في منصة رقيم
          </Text>
        </div>
      </div>

      {/* Privacy Content */}
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <Card className="mb-12 border-2 border-slate-900 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <Heading level={2} className="text-2xl font-bold mb-3">التزامنا بخصوصيتك</Heading>
                  <Text className="text-gray-700 leading-relaxed">
                    في رقيم، نأخذ خصوصيتك وأمان بياناتك على محمل الجد. هذه السياسة توضح كيفية جمع واستخدام وحماية معلوماتك الشخصية. نلتزم بالشفافية الكاملة ونمنحك السيطرة الكاملة على بياناتك.
                  </Text>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Sections */}
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
                أسئلة حول الخصوصية؟
              </Heading>
              <Text className="text-gray-600 mb-4">
                إذا كان لديك أي أسئلة أو استفسارات حول سياسة الخصوصية أو كيفية استخدام بياناتك
              </Text>
              <a
                href="mailto:privacy@raqeem.tn"
                className="text-slate-900 font-semibold hover:text-slate-700 transition-colors"
              >
                privacy@raqeem.tn
              </a>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                <Lock className="h-8 w-8 text-green-600" />
              </div>
              <Text className="font-semibold mb-2">تشفير قوي</Text>
              <Text variant="small" className="text-gray-600">بيانات مشفرة بمعايير بنكية</Text>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <Text className="font-semibold mb-2">حماية كاملة</Text>
              <Text variant="small" className="text-gray-600">مراقبة أمنية على مدار الساعة</Text>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                <UserCheck className="h-8 w-8 text-purple-600" />
              </div>
              <Text className="font-semibold mb-2">سيطرة كاملة</Text>
              <Text variant="small" className="text-gray-600">تحكم كامل في بياناتك</Text>
            </div>
          </div>

          {/* Last Updated */}
          <div className="mt-12 text-center">
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
