"use client";

import { useMediaQuery } from "../../../hooks/use-media-query";
import { MobileTable } from "./mobile-table";
import { DesktopTable } from "./desktop-table";
import type { GenericTableProps } from "./types";

export function GenericTable<TData>(props: GenericTableProps<TData>) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return <DesktopTable {...props} />;
  }

  return <MobileTable {...props} />;
}

export * from "./types";
export { MobileTable } from "./mobile-table";
export { DesktopTable } from "./desktop-table";
export { FilterDrawer } from "./filter-drawer";
export { FilterChips } from "./filter-chips";
export { DesktopFilters } from "./desktop-filters";
export { TablePagination } from "./pagination";