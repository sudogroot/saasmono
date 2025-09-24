"use client";

import React from "react";
import { globalSheet } from "@/stores/global-sheet-store";

interface SheetTriggerProps {
  children: React.ReactNode;
  title: string;
  component: string;
  props?: Record<string, any>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  onClose?: () => void;
  urlParams?: Record<string, string>;
}

export function SheetTrigger({ 
  children, 
  title, 
  component, 
  props, 
  size,
  onClose,
  urlParams 
}: SheetTriggerProps) {
  const handleClick = () => {
    globalSheet.open({
      title,
      component: component as any,
      props,
      size,
      onClose,
      urlParams
    });
  };

  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick
    } as any);
  }

  return <button onClick={handleClick}>{children}</button>;
}

// Legacy compatibility wrapper
export function SheetView({ openButton, title, content }: {
  openButton: React.ReactNode;
  title: string;
  content: React.ReactNode | any[];
}) {
  return (
    <SheetTrigger
      title={title}
      component="CustomContent"
      props={{ content }}
      size="lg"
    >
      {openButton}
    </SheetTrigger>
  );
}

// Export the main components
export { GlobalSheetProvider } from "./global-sheet-provider";
export { SheetFooter } from "./sheet-footer";
export { globalSheet, useGlobalSheet } from "@/stores/global-sheet-store";
export type { GlobalSheetData } from "@/stores/global-sheet-store";