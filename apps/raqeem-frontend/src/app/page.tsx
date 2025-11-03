import React from "react";
import { LandingPageContent } from "@/components/landing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "رقيم - نظام إدارة المؤسسات القانونية",
  description: "نظام إدارة شامل ومتطور للمكاتب القانونية ومكاتب المحاماة. إدارة القضايا، المنوبين، المواعيد، والمستندات بكفاءة عالية",
  openGraph: {
    title: "رقيم - نظام إدارة المؤسسات القانونية",
    description: "نظام إدارة شامل ومتطور للمكاتب القانونية ومكاتب المحاماة. إدارة القضايا، المنوبين، المواعيد، والمستندات بكفاءة عالية",
    url: "/",
    type: "website",
    locale: "ar_SA",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "رقيم - نظام إدارة المؤسسات القانونية",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "رقيم - نظام إدارة المؤسسات القانونية",
    description: "نظام إدارة شامل ومتطور للمكاتب القانونية ومكاتب المحاماة",
    images: ["/og-image.png"],
  },
};

export default function LandingPage() {
  return <LandingPageContent />;
}
