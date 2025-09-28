"use client";

import * as React from "react";
import { type LucideIcon } from "lucide-react";

// import { NavDocuments } from "./nav-documents";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: null as any,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: null as any,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: null as any,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: null as any,
    },
  ],
};

export interface AppSidebarProps {
  data: typeof data;
  brandLogo: React.ReactNode;
  brandIcon: React.ReactNode;
  brandName?: string;
}

export function AppSidebar({
  data: sidebarData,
  brandLogo,
  brandIcon,
  brandName,
  ...props
}: AppSidebarProps & React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();

  return (
    <Sidebar side="right" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="relative flex items-center justify-start min-h-8">
              <div
                className={`absolute inset-0 flex items-center justify-start transition-all duration-300 ease-in-out ${
                  open ? "visible" : "hidden"
                }`}
              >
                {brandLogo}
              </div>
              <div
                className={`absolute inset-0 flex items-center justify-start transition-all duration-300 ease-in-out ${
                  !open ? "visible" : "hidden"
                }`}
              >
                {brandIcon}
              </div>
              {/*<span className="text-base font-semibold">{brandName}</span>*/}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
        {/*<NavDocuments items={sidebarData.documents} />*/}
        <NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
