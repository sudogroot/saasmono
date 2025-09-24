"use client"

import * as React from "react"
import { Bell, Plus } from "lucide-react"
import { Button } from "@repo/ui"

import { usePathname } from "next/navigation"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@repo/ui"
import Image from "next/image"
import {breadcrumbs} from './config'



export function Navbar() {

  const pathname = usePathname()
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
                         <div  className="flex items-center gap-1">
                           <BreadcrumbSeparator />
                           <BreadcrumbItem>
                    <BreadcrumbPage >
                  {breadcrumbs[pathname as any] || ""}
                    </BreadcrumbPage>
                             </BreadcrumbItem>
                         </div>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      </div>
  )
}
