import React from "react";
import { Button, Heading, Text } from "@repo/ui";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="py-20 bg-primary text-white">
      <div className="container mx-auto px-4 text-center">
        <Heading level={2} className="mb-6">
          جاهز لتحويل مكتبك القانوني؟
        </Heading>
        <Text size="xl" className="mb-8 opacity-90 max-w-2xl mx-auto">
          انضم إلى  المحامين الذين يستخدمون رقيم لإدارة أعمالهم بكفاءة أكبر
        </Text>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
            <Link href="/register">ابدأ التجربة المجانية</Link>
          </Button>
        </div>

      </div>
    </section>
  );
}
