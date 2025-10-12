import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  // Make text and layout slightly larger below md
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-base md:text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 border border-primary",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 border border-destructive",
        outline:
          "border border-gray-300 bg-background shadow-sm hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-gray-200",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          // Slightly bigger height/padding below md
          "h-10 px-5 py-2.5 has-[>svg]:px-4 md:h-9 md:px-4 md:py-2 md:has-[>svg]:px-3",
        sm: "h-9 rounded-md gap-1.5 px-3.5 has-[>svg]:px-3 md:h-8 md:px-3 md:gap-1.5 md:has-[>svg]:px-2.5 text-sm md:text-xs",
        lg: "h-11 rounded-md px-7 has-[>svg]:px-5 md:h-10 md:px-6 md:has-[>svg]:px-4 text-lg md:text-base",
        icon: "size-10 md:size-9",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        size: "default",
        class:
          "[box-shadow:var(--shadow-button-primary)] active:[box-shadow:var(--shadow-button-primary-active)]",
      },
      {
        variant: "destructive",
        size: "default",
        class:
          "[box-shadow:var(--shadow-button-destructive)] active:[box-shadow:var(--shadow-button-destructive-active)]",
      },
      {
        variant: "default",
        size: "sm",
        class:
          "[box-shadow:var(--shadow-button-primary-sm)] active:[box-shadow:var(--shadow-button-primary-sm-active)]",
      },
      {
        variant: "destructive",
        size: "sm",
        class:
          "[box-shadow:var(--shadow-button-destructive-sm)] active:[box-shadow:var(--shadow-button-destructive-sm-active)]",
      },
      {
        variant: "default",
        size: "lg",
        class:
          "[box-shadow:var(--shadow-button-primary-lg)] active:[box-shadow:var(--shadow-button-primary-lg-active)]",
      },
      {
        variant: "destructive",
        size: "lg",
        class:
          "[box-shadow:var(--shadow-button-destructive-lg)] active:[box-shadow:var(--shadow-button-destructive-lg-active)]",
      },
      {
        variant: "default",
        size: "icon",
        class:
          "[box-shadow:var(--shadow-button-primary)] active:[box-shadow:var(--shadow-button-primary-active)]",
      },
      {
        variant: "destructive",
        size: "icon",
        class:
          "[box-shadow:var(--shadow-button-destructive)] active:[box-shadow:var(--shadow-button-destructive-active)]",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
