"use client";

import React from "react";
import {
  Header,
  Hero,
  FeaturesShowcase,
  CTASection1,
  Features,
  CTASection2,
  Testimonials,
  CTASection3,
  Pricing,
  FinalCTA,
  Footer
} from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="min-h-screen" dir="rtl">
      <Header />
      <Hero />
      <FeaturesShowcase />
      <CTASection1 />
      <Features />
      <CTASection2 />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
}
