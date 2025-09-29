"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@repo/ui";
import { Button } from "@repo/ui";
import { Separator } from "@repo/ui";
import { OpponentAvatar } from "./opponent-avatar";
import { orpc } from "@/utils/orpc";
import { globalSheet } from "@/stores/global-sheet-store";
import {
  Users,
  Calendar,
  Loader2,
  AlertCircle,
  Edit,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OpponentDetailsSheetProps {
  opponentId: string;
  organizationId?: string;
  renderMode?: 'content' | 'full';
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
  renderMode = 'content'
}: OpponentDetailsSheetProps) {
  const { data: opponentData, isLoading, error } = useQuery({
    ...orpc.opponents.getOpponentById.queryOptions({
      input: {
        opponentId: opponentId,
      },
    }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin ml-2" />
        <span>جاري تحميل بيانات الخصم...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8 text-destructive">
        <AlertCircle className="h-5 w-5 ml-2" />
        <span>حدث خطأ في تحميل البيانات</span>
      </div>
    );
  }

  if (!opponentData) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <span>لم يتم العثور على الخصم</span>
      </div>
    );
  }

  const handleEdit = () => {
    globalSheet.openOpponentForm({
      mode: 'edit',
      slug: 'opponents',
      opponentId: opponentData.id,
      size: 'lg'
    });
  };

  const handleAddCase = () => {
    globalSheet.openCaseForm({
      mode: 'create',
      slug: 'cases',
      opponentId: opponentData.id,
      size: 'lg'
    });
  };

  return (
    <div className="space-y-6 p-6">
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4 ml-1" />
            تعديل
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleAddCase}
          >
            <Plus className="h-4 w-4 ml-1" />
            إضافة قضية
          </Button>
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
    </div>
  );
}