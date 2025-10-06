import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon, ArrowLeft } from "lucide-react";
import { useIsMobile } from "../../hooks/use-mobile";
import { ScrollArea } from "./scroll-area";

import { cn } from "../../lib/utils";
import { Button } from "./button";

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "left",
  isMobileSheet = false,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
  isMobileSheet?: boolean;
}) {
  const isMobile = useIsMobile();

  if (isMobile && isMobileSheet) {
    side = "bottom";
  }

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "overflow-y-auto sm:p-0 sm:m-4 sm:rounded-lg sm:border sm:h-[calc(100vh-2.5rem)] bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-0 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          isMobile && isMobileSheet ? " h-[95vh] rounded-t-xl" : "",
          className,
        )}
        {...props}
      >
        {children}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({
  className,
  children,
  isGoback,
  onGoBack,
  backTitle,
  ...props
}: React.ComponentProps<"div"> & {
  isGoback?: boolean;
  backTitle?: string;
  onGoBack?: () => void;
}) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex gap-1.5 border-b", className)}
      {...props}
    >
      <div className="flex-1">{children}</div>
      {isGoback && onGoBack ? (
        <Button
          onClick={onGoBack}
          variant="secondary"
          size="sm"
          title={backTitle}
        >
          <ArrowLeft className="size-4" />
          <span className="sr-only">Back</span>
        </Button>
      ) : (
        <SheetPrimitive.Close asChild>
          <Button variant="secondary" size="sm">
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </Button>
        </SheetPrimitive.Close>
      )}
    </div>
  );
}

export function SheetBody({
  className,
  ...props
}: React.ComponentProps<typeof ScrollArea>) {
  return (
    <ScrollArea
      data-slot="sheet-body"
      className={cn(
        "w-full space-y-6 px-4 sm:h-[calc(100vh-128px)] h-[calc(99vh-88px)]",
        className,
      )}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
