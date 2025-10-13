import React from "react";
import { Badge, Heading, Text } from "@/components/base";
import { PlayCircle } from "lucide-react";

export function VideoDemo() {
  return (
    <section id="video-demo" className="relative py-20 md:py-28 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-700/20 via-slate-900/20 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-6 mb-12">
            <Badge variant="secondary" className="mb-2 bg-white/10 text-white border-white/20 px-4 py-2">
              <PlayCircle className="h-4 w-4 mr-2" />
              شاهد العرض التوضيحي
            </Badge>

            <Heading level={2} className="text-white text-4xl md:text-5xl lg:text-6xl font-extrabold">
              رقيم في دقيقتين
            </Heading>

            <Text size="xl" className="text-gray-300 max-w-3xl mx-auto font-medium">
              اكتشف كيف يمكن لرقيم تحويل إدارة مكتبك القانوني من الفوضى إلى النظام في دقائق معدودة
            </Text>
          </div>

          {/* Video Container - Enhanced */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-3xl blur-3xl opacity-50 animate-pulse" />

            {/* Video Player */}
            <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.6)] overflow-hidden border border-white/10 group">
              {/* Decorative Corner Accents */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-white/5 to-transparent rounded-tr-full" />

              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm">
                <div className="text-center space-y-6">
                  {/* Play Button - Modern Design */}
                  <div className="relative mx-auto w-28 h-28">
                    <div className="absolute inset-0 bg-white/10 rounded-full blur-xl animate-pulse" />
                    <button className="relative w-28 h-28 bg-gradient-to-br from-white to-gray-100 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-2xl group-hover:shadow-white/20">
                      <svg className="w-12 h-12 text-slate-900 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Text className="text-white text-lg font-semibold">جاهز للمشاهدة</Text>
                    <Text size="sm" className="text-gray-300">
                      مدة الفيديو: 2 دقيقة • جودة عالية
                    </Text>
                  </div>
                </div>
              </div>

              {/* You can replace this with actual video embed */}
              {/* Example with YouTube iframe:
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
                title="Raqeem Demo Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              */}
            </div>
          </div>

          {/* Video Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-center">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <Text className="text-2xl font-bold text-white">⚡</Text>
              <Text className="text-white font-medium mt-2">إعداد سريع</Text>
              <Text size="sm" className="text-gray-400 mt-1">ابدأ في أقل من 5 دقائق</Text>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <Text className="text-2xl font-bold text-white">🎯</Text>
              <Text className="text-white font-medium mt-2">واجهة بديهية</Text>
              <Text size="sm" className="text-gray-400 mt-1">سهلة الاستخدام للجميع</Text>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <Text className="text-2xl font-bold text-white">🔒</Text>
              <Text className="text-white font-medium mt-2">أمان متقدم</Text>
              <Text size="sm" className="text-gray-400 mt-1">حماية بياناتك بأعلى معايير</Text>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
