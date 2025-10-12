import React from "react";
import { cn } from "../../../lib/utils";

export interface TextProps {
  children: React.ReactNode;
  variant?: "body" | "caption" | "small" | "muted" | "lead";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  className?: string;
  truncate?: boolean;
  as?: "p" | "span" | "div";
}

const variantClasses = {
  body: "text-foreground",
  caption: "text-base md:text-sm text-muted-foreground",
  small: "text-sm md:text-xs text-muted-foreground",
  muted: "text-muted-foreground",
  lead: "text-xl md:text-lg text-muted-foreground",
};

const sizeClasses = {
  xs: "text-base md:text-sm",
  sm: "text-lg md:text-base",
  base: "text-lg md:text-base",
  lg: "text-xl md:text-lg",
  xl: "text-2xl md:text-xl",
  "2xl": "text-3xl md:text-2xl",
};

const weightClasses = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

export const Text: React.FC<TextProps> = ({
  children,
  variant = "body",
  size,
  weight = "normal",
  className,
  truncate = false,
  as = "p",
}) => {
  const Component = as;

  return (
    <Component
      className={cn(
        variantClasses[variant],
        size && sizeClasses[size],
        weightClasses[weight],
        truncate && "truncate",
        className,
      )}
    >
      {children}
    </Component>
  );
};
