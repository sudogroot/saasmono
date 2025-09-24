"use client";

import React, { Suspense, useMemo } from "react";
import {
  useGlobalSheet,
  SHEET_COMPONENTS,
  globalSheet,
} from "@/stores/global-sheet-store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Loader2, ArrowRight, X } from "lucide-react";
import { SheetFooter } from "./sheet-footer";

function DynamicSheetContent({
  component,
  props,
}: {
  component: string;
  props?: any;
}) {
  const Component = useMemo(() => {
    const componentLoader = SHEET_COMPONENTS[component];
    if (!componentLoader) {
      return () => (
        <div className="p-6 text-center text-red-600">
          Component "{component}" not found in registry
        </div>
      );
    }

    return React.lazy(
      componentLoader as () => Promise<{ default: React.ComponentType<any> }>,
    );
  }, [component]);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin ml-2" />
          جاري التحميل...
        </div>
      }
    >
      <Component {...(props || {})} />
    </Suspense>
  );
}

export function GlobalSheetProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isOpen = useGlobalSheet((state) => state.isOpen);
  const sheetStack = useGlobalSheet((state) => state.sheetStack);
  
  const isMobile = !useMediaQuery("(min-width: 768px)");

  // Calculate current sheet directly from the subscribed sheetStack
  const currentSheet = sheetStack.length > 0 ? sheetStack[sheetStack.length - 1] : null;
  const canGoBack = sheetStack.length > 1;
  
  // Get navigation info based on current state
  const navigationInfo = {
    canGoBack,
    previousSheetTitle: canGoBack ? sheetStack[sheetStack.length - 2].title : null,
    stackDepth: sheetStack.length,
    currentSheet
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      globalSheet.closeAll();
    }
  };

  const handleBack = () => {
    globalSheet.back();
  };

  const handleForceClose = () => {
    globalSheet.closeAll();
  };

  return (
    <>
      {children}
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent
          side={isMobile ? "bottom" : "left"}
          className={`w-full max-w-none gap-0
            sm:p-0 sm:m-4 sm:rounded-lg sm:border sm:h-[calc(100vh-2.5rem)]
            ${isMobile ? "h-[99vh] rounded-t-xl" : ""}
            ${
              currentSheet?.size === "sm"
                ? "sm:max-w-md"
                : currentSheet?.size === "md"
                  ? "sm:max-w-lg"
                  : currentSheet?.size === "lg"
                    ? "sm:max-w-2xl"
                    : currentSheet?.size === "xl"
                      ? "sm:max-w-4xl"
                      : currentSheet?.size === "full"
                        ? "sm:max-w-full"
                        : "sm:max-w-3xl"
            } flex flex-col p-0`}
        >
          <SheetHeader className="flex-shrink-0 px-4 py-2 sm:px-6 sm:py-4 border-b">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleForceClose}
                className="p-1 sm:p-2 hover:bg-gray-100"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>

              <SheetTitle className="text-center flex-1 text-sm sm:text-md font-bold">
                {currentSheet?.title}
              </SheetTitle>

              <div className="flex items-center gap-2">
                {navigationInfo.canGoBack &&
                  navigationInfo.previousSheetTitle && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleBack}
                      className="flex items-center gap-1 sm:gap-2 hover:bg-gray-100 text-xs sm:text-sm p-1 sm:p-2"
                      title={`العودة إلى: ${navigationInfo.previousSheetTitle}`}
                    >
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 scale-x-[-1]" />
                    </Button>
                  )}
              </div>
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-auto">
            {currentSheet && (
              <DynamicSheetContent
                component={currentSheet.component}
                props={currentSheet.props}
              />
            )}
          </div>

          {currentSheet?.footer && currentSheet.footer.type !== "none" && (
            <SheetFooter
              showBack={navigationInfo.canGoBack}
              showClose={true}
              showSubmit={currentSheet.footer.type === "form"}
              submitLabel={currentSheet.footer.actions?.submitLabel}
              onSubmit={currentSheet.footer.actions?.onSubmit}
              submitLoading={currentSheet.footer.actions?.isLoading}
              showStepNavigation={
                !!currentSheet.footer.actions?.totalSteps &&
                currentSheet.footer.actions.totalSteps > 1
              }
              currentStep={currentSheet.footer.actions?.currentStep}
              totalSteps={currentSheet.footer.actions?.totalSteps}
              canGoPrevious={currentSheet.footer.actions?.canGoPrevious}
              canGoNext={currentSheet.footer.actions?.canGoNext}
              onPrevious={currentSheet.footer.actions?.onPrevious}
              onNext={currentSheet.footer.actions?.onNext}
              errorMessage={currentSheet.footer.actions?.errorMessage}
              customActions={
                currentSheet.footer.actions?.onCancel
                  ? [
                      {
                        label: "إلغاء",
                        onClick: currentSheet.footer.actions.onCancel,
                        variant: "outline" as const,
                        disabled: currentSheet.footer.actions?.isLoading,
                      },
                    ]
                  : []
              }
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}