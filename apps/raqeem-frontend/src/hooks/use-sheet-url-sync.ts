"use client";

import { useEffect } from 'react';
import { globalSheet } from '@/stores/global-sheet-store';

export function useSheetUrlSync() {
  useEffect(() => {
    // Initialize sheet from URL on mount
    globalSheet.initializeFromUrl();
  }, []);
}