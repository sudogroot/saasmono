'use client'

import { cn } from '@/lib/utils'
import type { Opponent } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui'

interface OpponentAvatarProps {
  opponent: Opponent
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

export function OpponentAvatar({ opponent, size = 'md', className }: OpponentAvatarProps) {
  const namesParts = opponent.name.split(' ')
  const initials =
    namesParts.length >= 2
      ? `${namesParts?.[0]?.charAt(0)}${namesParts[1]?.charAt(0)}`.toUpperCase()
      : opponent.name.substring(0, 2).toUpperCase()

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={`/api/avatars/opponent/${opponent.id}`} alt={opponent.name} />
      <AvatarFallback className="bg-destructive/10 text-destructive font-semibold">{initials}</AvatarFallback>
    </Avatar>
  )
}
