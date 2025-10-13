import React from "react";
import { cn } from "@/lib/utils";

export interface HeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  truncate?: boolean;
}

const headingClasses = {
  1: "text-3xl md:text-4xl font-bold tracking-tight",
  2: "text-2xl md:text-3xl font-semibold tracking-tight",
  3: "text-xl md:text-2xl font-semibold tracking-tight",
  4: "text-lg md:text-xl font-medium tracking-tight",
  5: "text-base md:text-lg font-medium",
  6: "text-sm md:text-base font-medium",
};

export const Heading: React.FC<HeadingProps> = ({
  children,
  level = 1,
  className,
  truncate = false,
}) => {
  const Component = `h${level}` as React.ElementType;

  return React.createElement(
    Component,
    {
      className: cn(headingClasses[level], truncate && "truncate", className),
    },
    children
  );
};
