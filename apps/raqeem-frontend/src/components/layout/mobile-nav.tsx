"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  MoreHorizontal,
  LogOut,
  Bell,
  Search,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import {drawerItems, mainNavItems,quickActions} from './config'
// import { globalSheet } from "@/stores/global-sheet-store";


export function MobileNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    const fullPath = `/dashboard/${href}`;
    const dashboardPath = `/dashboard`;

    if (href === "") {
      return pathname === dashboardPath;
    }
    return pathname.startsWith(fullPath);
  };

  const handleQuickAction = (action: string) => {
    setDrawerOpen(false);

    // switch (action) {
    //   case "create-case":
    //     globalSheet.openCaseForm({
    //       mode: "create",
    //       slug: slug,
    //       size: "lg"
    //     });
    //     break;
    //   case "create-client":
    //     // TODO: Add client form when available
    //     console.log("Create client action");
    //     break;
    //   case "create-appointment":
    //     // TODO: Add appointment form when available
    //     console.log("Create appointment action");
    //     break;
    //   case "search":
    //     // TODO: Add search functionality
    //     console.log("Search action");
    //     break;
    //   default:
    //     break;
    // }
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 lg:hidden">
        <div className="grid grid-cols-5 h-16">
          {/* Main Navigation Items */}
          {mainNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={`/dashboard/${item.href}`}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-1 transition-colors relative",
                  active
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  active ? item.bgColor : "hover:bg-gray-100"
                )}>
                  <item.icon className={cn(
                    "h-5 w-5",
                    active ? item.color : "text-current"
                  )} />
                </div>
                <span className="text-xs font-medium mt-0.5 leading-none">
                  {item.title}
                </span>
                {active && (
                  <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full"></div>
                )}
              </Link>
            );
          })}

          {/* More Button with Drawer */}
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerTrigger asChild>
              <button className="flex flex-col items-center justify-center py-2 px-1 text-gray-500 hover:text-gray-700 transition-colors">
                <div className="p-1.5 rounded-lg hover:bg-gray-100">
                  <MoreHorizontal className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium mt-0.5 leading-none">المزيد</span>
              </button>
            </DrawerTrigger>

            <DrawerContent className="max-h-[85vh]" dir="rtl">
              <DrawerHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <DrawerTitle>القائمة الرئيسية</DrawerTitle>
                    <DrawerDescription>
                      الوصول السريع لجميع الميزات والإعدادات
                    </DrawerDescription>
                  </div>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Quick Actions */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">إجراءات سريعة</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {quickActions.map((action) => (
                      <Button
                        key={action.action}
                        variant="ghost"
                        className={cn(
                          "h-auto p-4 justify-start gap-3",
                          action.color
                        )}
                        onClick={() => handleQuickAction(action.action)}
                      >
                        <action.icon className="h-5 w-5" />
                        <span className="font-medium">{action.title}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Navigation Categories */}
                {drawerItems.map((category) => (
                  <div key={category.category}>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      {category.category}
                    </h3>
                    <div className="space-y-2">
                      {category.items.map((item) => {
                        const active = isActive(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={`/dashboard/${item.href}`}
                            onClick={() => setDrawerOpen(false)}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg transition-colors",
                              active
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-gray-50 text-gray-700"
                            )}
                          >
                            <div className={cn(
                              "p-2 rounded-lg",
                              active ? "bg-primary/20" : "bg-gray-100"
                            )}>
                              <item.icon className={cn(
                                "h-4 w-4",
                                active ? "text-primary" : "text-gray-600"
                              )} />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{item.title}</div>
                              <div className="text-xs text-gray-500 leading-tight">
                                {item.description}
                              </div>
                            </div>
                            {active && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <DrawerFooter className="border-t">
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm">
                    <Bell className="h-4 w-4 mr-2" />
                    التنبيهات
                    <Badge variant="destructive" className="mr-2">3</Badge>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    تسجيل الخروج
                  </Button>
                </div>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {/* Bottom padding for content to avoid bottom nav overlap */}
      <div className="h-16 lg:hidden" />
    </>
  );
}
