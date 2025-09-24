"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui";
import { cn } from "@/lib/utils";
import type { Case } from "@/types";
import { FileText } from "lucide-react";

interface CaseAvatarProps {
  case_: Case;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

export function CaseAvatar({ case_, size = "md", className }: CaseAvatarProps) {
  const caseNumberParts = case_.caseNumber.split(/[^\w]/);
  const initials = caseNumberParts.length >= 2 
    ? `${caseNumberParts[0].substring(0, 1)}${caseNumberParts[1].substring(0, 1)}`.toUpperCase()
    : case_.caseNumber.substring(0, 2).toUpperCase();
  
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={`/api/avatars/case/${case_.id}`} alt={case_.caseNumber} />
      <AvatarFallback className="bg-amber-50 text-amber-700 font-semibold">
        {initials || <FileText className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  );
}