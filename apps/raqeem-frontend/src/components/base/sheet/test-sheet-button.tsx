"use client";

import { Button } from "@/components/ui/button";
import { globalSheet } from "@/stores/global-sheet-store";

export function TestSheetButton() {
  const handleTestSheet = () => {
    globalSheet.open({
      title: "Test Sheet",
      component: "CustomContent",
      props: {
        content: (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Sheet Test</h3>
            <p>If you can see this, the sheet functionality is working correctly!</p>
          </div>
        )
      },
      size: "md"
    });
  };

  return (
    <Button onClick={handleTestSheet} variant="outline">
      Test Sheet
    </Button>
  );
}