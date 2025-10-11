"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import type { ToasterProps } from "sonner";
import { useEffect } from "react";

type ToasterComponentProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterComponentProps) => {
  const { theme = "system" } = useTheme();
  console.log("Toaster component mounted with theme:", theme);

  useEffect(() => {
    console.log("Toaster component mounted with theme:", theme);
  }, [theme]);

  return (
    <Sonner
      theme={theme as ToasterComponentProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
