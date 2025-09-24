"use client";

import React from "react";
import { Button } from "@repo/ui";
import { ArrowRight, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { globalSheet } from "@/stores/global-sheet-store";

interface SheetFooterAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

interface SheetFooterProps {
  showBack?: boolean;
  showClose?: boolean;
  onBack?: () => void;
  onClose?: () => void;
  
  showSubmit?: boolean;
  submitLabel?: string;
  onSubmit?: () => void;
  submitLoading?: boolean;
  
  showStepNavigation?: boolean;
  currentStep?: number;
  totalSteps?: number;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  
  errorMessage?: string;
  customActions?: SheetFooterAction[];
  align?: "left" | "center" | "right" | "between";
}

export function SheetFooter({
  showBack = true,
  showClose = true,
  onBack,
  onClose,
  
  showSubmit = false,
  submitLabel = "حفظ",
  onSubmit,
  submitLoading = false,
  
  showStepNavigation = false,
  currentStep,
  totalSteps,
  canGoPrevious = false,
  canGoNext = false,
  onPrevious,
  onNext,
  
  errorMessage,
  customActions = [],
  align = "between"
}: SheetFooterProps) {
  
  const navigationInfo = globalSheet.getNavigationInfo();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      globalSheet.back();
    }
  };
  
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      globalSheet.closeAll();
    }
  };
  
  const isLoading = submitLoading;
  
  const hasActions = showBack || showClose || showSubmit || showStepNavigation || customActions.length > 0;
  if (!hasActions) return null;
  
  const leftSideActions = [];
  const rightSideActions = [];
  const centerContent = [];
  
  if (showBack && navigationInfo.canGoBack) {
    leftSideActions.push(
      <Button
        key="back"
        type="button"
        variant="outline"
        onClick={handleBack}
        disabled={isLoading}
        title={`العودة إلى: ${navigationInfo.previousSheetTitle}`}
      >
        <ArrowRight className="h-4 w-4 ml-1 scale-x-[-1]" />
        رجوع
      </Button>
    );
  }
  
  if (showClose) {
    leftSideActions.push(
      <Button
        key="close"
        type="button"
        variant="ghost"
        onClick={handleClose}
        disabled={isLoading}
        className="text-gray-600 hover:text-gray-800"
        title="إغلاق جميع الصفحات"
      >
        إغلاق
      </Button>
    );
  }
  
  customActions.forEach((action, index) => {
    const button = (
      <Button
        key={`custom-${index}`}
        type="button"
        variant={action.variant || "outline"}
        onClick={action.onClick}
        disabled={action.disabled || isLoading}
      >
        {action.loading ? (
          <Loader2 className="h-4 w-4 ml-1 animate-spin" />
        ) : (
          action.icon
        )}
        {action.label}
      </Button>
    );
    
    leftSideActions.push(button);
  });
  
  if (errorMessage) {
    centerContent.push(
      <div key="error" className="text-sm text-red-600 bg-red-50 p-2 rounded-md flex-1 mx-4">
        {errorMessage}
      </div>
    );
  }
  
  if (showStepNavigation && totalSteps && totalSteps > 1) {
    rightSideActions.push(
      <span key="step-indicator" className="text-sm text-gray-600">
        {currentStep} / {totalSteps}
      </span>
    );
    
    if (onPrevious) {
      rightSideActions.push(
        <Button
          key="step-previous"
          type="button"
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={isLoading || !canGoPrevious}
        >
          <ChevronRight className="h-4 w-4" />
          السابق
        </Button>
      );
    }
    
    if (onNext) {
      rightSideActions.push(
        <Button
          key="step-next"
          type="button"
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={isLoading || !canGoNext}
          className={!canGoNext && !isLoading ? "opacity-50" : ""}
          title={!canGoNext && !isLoading ? "يجب ملء الحقول المطلوبة في هذه الخطوة أولاً" : ""}
        >
          التالي
          <ChevronLeft className="h-4 w-4 mr-1" />
        </Button>
      );
    }
  }
  
  if (showSubmit) {
    const isSubmitDisabled = isLoading || !onSubmit;
    rightSideActions.push(
      <Button
        key="submit"
        type="button"
        onClick={onSubmit}
        disabled={isSubmitDisabled}
        className={isSubmitDisabled && !isLoading ? "opacity-50" : ""}
        title={!onSubmit && !isLoading ? "يجب ملء الحقول المطلوبة أولاً" : ""}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 ml-2 animate-spin" />
            جاري الحفظ...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    );
  }
  
  const getLayoutClassName = () => {
    switch (align) {
      case "left":
        return "justify-start";
      case "center":
        return "justify-center";
      case "right":
        return "justify-end";
      case "between":
      default:
        return "justify-between";
    }
  };
  
  return (
    <div className="flex-shrink-0 border-t bg-white p-4">
      <div className={`flex items-center ${getLayoutClassName()}`}>
        {leftSideActions.length > 0 && (
          <div className="flex gap-2">
            {leftSideActions}
          </div>
        )}
        
        {centerContent.length > 0 && centerContent}
        
        {rightSideActions.length > 0 && (
          <div className="flex items-center gap-2">
            {rightSideActions}
          </div>
        )}
      </div>
    </div>
  );
}