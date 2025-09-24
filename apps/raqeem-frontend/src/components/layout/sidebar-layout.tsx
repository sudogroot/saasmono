"use client";

import * as React from "react";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";


export function SidebarLayout({
  navbar,
  sidebar,
  children,
}: React.PropsWithChildren<{
  navbar: React.ReactNode;
  sidebar:
    | React.ReactNode
    | ((props: { isCollapsed: boolean }) => React.ReactNode);
}>) {
  const [isCollapsed, setIsCollapsed] = useState(false);


  const renderSidebar = () => {
    if (typeof sidebar === "function") {
      return sidebar({ isCollapsed });
    }
    return sidebar;
  };

  return (
    <div className="relative isolate flex min-h-svh w-full bg-white max-lg:flex-col lg:bg-zinc-100 dark:bg-zinc-900 dark:lg:bg-zinc-950">
      {/* Sidebar on desktop */}
      <div
        className={`fixed inset-y-0 right-0 max-lg:hidden transition-all duration-300 ease-in-out ${isCollapsed ? "w-16" : "w-64"}`}
      >
        <div className="relative h-full">
          {renderSidebar()}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -left-3 top-6 h-6 w-6 rounded-full border bg-background shadow-md hover:bg-accent z-10"
          >
            {isCollapsed ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Hide mobile sidebar - using bottom nav instead */}
      {/* <MobileSidebar open={showSidebar} close={() => setShowSidebar(false)}>
        {renderSidebar()}
      </MobileSidebar> */}

      {/* Simplified navbar on mobile */}
      <header className="flex items-center px-4 lg:hidden">
        <div className="min-w-0 flex-1">{navbar}</div>
      </header>

      {/* Content */}
      <main
        className={`flex flex-1 flex-col pb-20 md:pb-2 lg:min-w-0 lg:pt-2 lg:pl-2 transition-all duration-300 ease-in-out ${isCollapsed ? "lg:pr-16" : "lg:pr-64"}`}
      >
        <div className="grow sm:p-6 p-2 lg:rounded-lg lg:bg-white lg:p-10 lg:[box-shadow:var(--shadow-content-panel)] lg:ring-1 lg:ring-zinc-950/5 dark:lg:bg-zinc-900 dark:lg:ring-white/10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </div>
      </main>
    </div>
  );
}
