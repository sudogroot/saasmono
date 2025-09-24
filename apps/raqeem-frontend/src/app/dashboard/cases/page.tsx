"use client";

import { Plus } from "lucide-react";
import { Button } from "@repo/ui";
import { CasesTable } from "@/components/cases/cases-table";
import { globalSheet } from "@/stores/global-sheet-store";

export default function CasesPage() {
  const handleCreateNew = () => {
    globalSheet.openCaseForm({
      mode: 'create',
      slug: 'cases',
      size: 'lg'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">القضايا</h1>
          <p className="text-muted-foreground">
            إدارة جميع القضايا والدعاوى القضائية
          </p>
        </div>

        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة قضية جديدة
        </Button>
      </div>

      <CasesTable onCreateNew={handleCreateNew} />
    </div>
  );
}