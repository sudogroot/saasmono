"use client"

import * as React from "react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/breadcrumb"
import Image from "next/image"

export interface RaqeemNavbarProps {
  breadcrumbs: Record<string, string>;
  pathname: string;
}

export function RaqeemNavbar({ breadcrumbs, pathname }: RaqeemNavbarProps) {
  return (
    <div className="flex items-center justify-between w-full">
      {/* Breadcrumbs */}
      <div className="flex-1 min-w-0">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/dashboard`} className="m-2">
                <Image src="/raqeem-logo.svg" alt="Logo" width={75} height={30} />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <div className="flex items-center gap-1">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {breadcrumbs[pathname] || ""}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </div>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  )
}