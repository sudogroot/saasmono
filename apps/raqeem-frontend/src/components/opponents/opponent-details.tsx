"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@repo/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@repo/ui";
import { Badge } from "@repo/ui";
import { Separator } from "@repo/ui";
import { OpponentAvatar } from "./opponent-avatar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { orpc } from "@/utils/orpc";
import { 
  Eye, 
  Users, 
  Calendar,
  Loader2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OpponentDetailsProps {
  opponentId: string;
  organizationId?: string;
  buttonVariant?: "default" | "outline" | "ghost" | "secondary";
  buttonSize?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
  trigger?: React.ReactNode;
}

const opponentTypeColors = {
  individual: "bg-red-50 text-red-700 border-red-200",
  company: "bg-orange-50 text-orange-700 border-orange-200", 
  institution: "bg-pink-50 text-pink-700 border-pink-200",
  organization: "bg-purple-50 text-purple-700 border-purple-200",
  government: "bg-gray-50 text-gray-700 border-gray-200",
  association: "bg-rose-50 text-rose-700 border-rose-200",
} as const;

const opponentTypeLabels = {
  individual: "فرد",
  company: "شركة", 
  institution: "مؤسسة",
  organization: "منظمة",
  government: "حكومي",
  association: "جمعية",
} as const;

export function OpponentDetails({ 
  opponentId, 
  organizationId,
  buttonVariant = "ghost", 
  buttonSize = "sm",
  className,
  showText = false,
  trigger 
}: OpponentDetailsProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { data: opponentData, isLoading, error } = useQuery({
    ...orpc.opponents.getById.queryOptions({
      input: {
        id: opponentId,
        includeDeleted: false,
      },
    }),
    enabled: open,
  });

  const defaultTrigger = (
    <Button 
      variant={buttonVariant} 
      size={buttonSize}
      className={cn("", className)}
    >
      <Eye className="h-4 w-4" />
      {showText && <span className="mr-1">عرض</span>}
    </Button>
  );

  const triggerElement = trigger || defaultTrigger;

  const content = (
    <div className="space-y-6">
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin ml-2" />
          <span>جاري تحميل بيانات الخصم...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-8 text-destructive">
          <AlertCircle className="h-5 w-5 ml-2" />
          <span>حدث خطأ في تحميل البيانات</span>
        </div>
      )}

      {opponentData && (
        <>
          {/* Header */}
          <div className="flex items-start gap-4">
            <OpponentAvatar opponent={opponentData} size="xl" />
            <div className="flex-1 space-y-2">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {opponentData.name}
                </h2>
              </div>
              <Badge 
                variant="outline"
                className={cn("w-fit", opponentTypeColors[opponentData.opponentType as keyof typeof opponentTypeColors])}
              >
                {opponentTypeLabels[opponentData.opponentType as keyof typeof opponentTypeLabels]}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              المعلومات الأساسية
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">نوع الخصم</label>
                <p className="text-foreground">{opponentTypeLabels[opponentData.opponentType as keyof typeof opponentTypeLabels]}</p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              التواريخ
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">تاريخ الإضافة</p>
                <p className="text-foreground">
                  {new Date(opponentData.createdAt).toLocaleDateString("ar-TN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              
              <div>
                <p className="text-muted-foreground">آخر تحديث</p>
                <p className="text-foreground">
                  {new Date(opponentData.updatedAt).toLocaleDateString("ar-TN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {triggerElement}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل الخصم</DialogTitle>
            <DialogDescription>
              عرض جميع المعلومات المتعلقة بالخصم
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {triggerElement}
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>تفاصيل الخصم</DrawerTitle>
          <DrawerDescription>
            عرض جميع المعلومات المتعلقة بالخصم
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 overflow-y-auto">
          {content}
        </div>
      </DrawerContent>
    </Drawer>
  );
}