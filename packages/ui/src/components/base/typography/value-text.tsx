import React from "react";
import { cn } from "../../../lib/utils";

export interface ValueTextProps {
  value?: string | null;
  fallbackText?: string;
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl";
  className?: string;
  truncate?: boolean;
}

const sizeClasses = {
  xs: "text-sm md:text-xs",
  sm: "text-base md:text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
};

export const ValueText: React.FC<ValueTextProps> = ({
  value,
  fallbackText = "NO_VALUE",
  size = "base",
  className,
  truncate = false,
}) => {
  const isEmpty = !value || value.trim() === "";

  return (
    <span
      className={cn(
        sizeClasses[size],
        isEmpty ? "text-muted-foreground italic" : "text-foreground",
        truncate && "truncate",
        className,
      )}
    >
      {isEmpty ? fallbackText : value}
    </span>
  );
};
