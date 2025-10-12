import React from "react";
import { Badge, Heading, Text } from "@repo/ui";
import { PlayCircle } from "lucide-react";

export function VideoDemo() {
  return (
    <section id="demo" className="py-12 md:py-16 bg-gradient-to-br from-slate-900 to-slate-700 text-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <Badge variant="secondary" className="mb-2 bg-white/10 text-white border-white/20">
            <PlayCircle className="h-4 w-4 mr-2" />
            عرض توضيحي
          </Badge>

          <Heading level={2} className="text-white text-3xl md:text-4xl font-bold">
            شاهد رقيم في العمل
          </Heading>

          <Text size="lg" className="text-gray-200 max-w-2xl mx-auto">
            اكتشف كيف يمكن لرقيم تبسيط إدارة مكتبك القانوني في دقائق معدودة
          </Text>

          {/* Video Placeholder */}
          <div className="relative aspect-video bg-gray-900 rounded-xl shadow-2xl overflow-hidden mt-8 border-2 border-white/10">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 md:w-24 md:h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer group">
                  <PlayCircle className="h-10 w-10 md:h-12 md:w-12 text-white group-hover:scale-110 transition-transform" />
                </div>
                <Text className="text-white/80">انقر للمشاهدة</Text>
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

          <Text size="sm" className="text-gray-300 pt-4">
            مدة الفيديو: 3 دقائق | شرح شامل لجميع الميزات الأساسية
          </Text>
        </div>
      </div>
    </section>
  );
}
