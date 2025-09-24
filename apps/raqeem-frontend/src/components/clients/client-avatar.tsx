"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Client } from "@/types";

// Client type is now imported from shared types

interface ClientAvatarProps {
  client: Client;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

export function ClientAvatar({ client, size = "md", className }: ClientAvatarProps) {
  const namesParts = client.name.split(' ');
  const initials = namesParts.length >= 2 
    ? `${namesParts[0].charAt(0)}${namesParts[1].charAt(0)}`.toUpperCase()
    : client.name.substring(0, 2).toUpperCase();
  
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={`/api/avatars/${client.id}`} alt={client.name} />
      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}