'use client'

import { globalSheet } from '@/stores/global-sheet-store'
import { Button, Card, Text } from '@repo/ui'
import { Mail, Phone, ChevronLeft, Users } from 'lucide-react'
import { EntityBadge } from '../base/entity-badge'
import { cn } from '@repo/ui/lib/utils'

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  clientType: string
  createdAt: Date
}

interface LatestClientsEnhancedProps {
  clients: Client[]
  onViewAll?: () => void
}

export function LatestClientsEnhanced({ clients, onViewAll }: LatestClientsEnhancedProps) {
  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMs = now.getTime() - new Date(date).getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'اليوم'
    if (diffInDays === 1) return 'أمس'
    if (diffInDays < 7) return `منذ ${diffInDays} أيام`
    if (diffInDays < 30) return `منذ ${Math.floor(diffInDays / 7)} أسابيع`
    return `منذ ${Math.floor(diffInDays / 30)} شهر`
  }

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold sm:text-lg">أحدث المنوبين</h3>
            {clients.length > 0 && (
              <span className="bg-purple-600/10 text-purple-700 dark:text-purple-400 rounded-full px-2 py-0.5 text-xs font-medium">
                {clients.length}
              </span>
            )}
          </div>
          {clients.length > 0 && onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll} className="h-7 gap-1 text-xs">
              عرض الكل
              <ChevronLeft className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-3">
        {clients.length === 0 ? (
          <div className="text-muted-foreground rounded-lg border-2 border-dashed py-12 text-center">
            <Users className="text-muted-foreground/50 mx-auto mb-3 h-10 w-10 sm:h-12 sm:w-12" />
            <Text size="sm" className="text-xs sm:text-sm">لا يوجد منوبين بعد</Text>
          </div>
        ) : (
          <div className="space-y-2">
            {clients.map((client) => (
              <button
                key={client.id}
                className={cn(
                  'group w-full rounded-lg border border-l-4 border-l-purple-500 bg-card p-3 text-right transition-all',
                  'hover:border-primary/50 hover:shadow-md hover:scale-[1.01]',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50',
                  'active:scale-[0.99]'
                )}
                onClick={() => {
                  globalSheet.openClientDetails({
                    slug: 'clients',
                    clientId: client.id,
                    size: 'md',
                  })
                }}
              >
                <div className="space-y-2.5">
                  {/* Name and time */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <Text weight="semibold" className="line-clamp-1 text-sm sm:text-base">
                        {client.name}
                      </Text>
                      <EntityBadge type="entityType" value={client.clientType} className="text-[10px] sm:text-xs" showIcon={false} />
                    </div>
                    <span className="bg-muted text-muted-foreground mt-0.5 flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium">
                      {getTimeAgo(client.createdAt)}
                    </span>
                  </div>

                  {/* Contact info */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground sm:text-sm">
                    {client.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 flex-shrink-0 sm:h-3.5 sm:w-3.5" />
                        <span dir="ltr" className="font-mono">{client.phone}</span>
                      </div>
                    )}
                    {client.email && (
                      <div className="flex items-center gap-1 min-w-0">
                        <Mail className="h-3 w-3 flex-shrink-0 sm:h-3.5 sm:w-3.5" />
                        <span className="truncate font-mono text-[10px] sm:text-xs" dir="ltr">
                          {client.email}
                        </span>
                      </div>
                    )}
                    {!client.phone && !client.email && (
                      <span className="text-muted-foreground/60 text-xs italic">لا توجد معلومات اتصال</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
