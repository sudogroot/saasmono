"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { globalSheet } from "@/stores/global-sheet-store";

export function UrlDebugger() {
  useEffect(() => {
    console.log("UrlDebugger mounted, current URL:", window.location.href);
  }, []);

  const handleManualInit = () => {
    console.log("Manual initialization triggered");
    globalSheet.initializeFromUrl();
  };

  const handleTestSheet = () => {
    console.log("Testing direct sheet open");
    globalSheet.openCaseDetails({
      slug: "cases",
      caseId: "665f6a15-94bc-4942-a43e-489032955b80",
      size: "lg"
    });
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded p-4 shadow-lg z-50">
      <h3 className="font-bold mb-2">Sheet Debugger</h3>
      <div className="space-y-2">
        <Button size="sm" onClick={handleManualInit}>
          Initialize from URL
        </Button>
        <Button size="sm" onClick={handleTestSheet}>
          Test Direct Open
        </Button>
      </div>
      <div className="text-xs text-gray-500 mt-2">
        Check console for logs
      </div>
    </div>
  );
}