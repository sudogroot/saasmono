"use client";

import { Button } from "@repo/ui";
import { globalSheet } from "@/stores/global-sheet-store";

export function TestSheet() {
  return (
    <div className="p-4 space-y-4">
      <h2>Test Sheet Integration</h2>
      
      <div className="space-y-2">
        <Button 
          onClick={() => globalSheet.open({
            title: "Test Custom Content",
            component: "CustomContent",
            props: { content: <div>This is a test sheet!</div> },
            size: "md"
          })}
        >
          Test Custom Sheet
        </Button>

        <Button
          onClick={() => globalSheet.openClientDetails({
            slug: "test-slug",
            clientId: "test-client-123",
            size: "md"
          })}
        >
          Test Client Details (will fail but should open sheet)
        </Button>
      </div>

      <div className="text-sm text-gray-600">
        <p>URL: {typeof window !== 'undefined' ? window.location.href : 'SSR'}</p>
      </div>
    </div>
  );
}