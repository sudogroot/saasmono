"use client";

import React from "react";
import {
  Header,
  Hero,
  VideoDemo,
  FeaturesSimple,
  Testimonials,
  Pricing,
  FinalCTA,
  Footer,
  StickyCTA
} from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="min-h-screen" dir="rtl">
      <Header />
      <Hero />
      <VideoDemo />
      <FeaturesSimple />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
      <StickyCTA />
    </div>
  );
}
