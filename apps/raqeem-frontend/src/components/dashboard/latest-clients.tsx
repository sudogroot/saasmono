'use client'

import { globalSheet } from '@/stores/global-sheet-store'
import { Text } from '@repo/ui'
import { Mail, Phone } from 'lucide-react'
import { EntityBadge } from '../base/entity-badge'

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  clientType: string
  createdAt: Date
}

interface LatestClientsProps {
  clients: Client[]
}

export function LatestClients({ clients }: LatestClientsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">أحدث المنوبين</h3>
        {clients.length > 0 && <Text variant="muted" size="sm">{clients.length}</Text>}
      </div>

      {clients.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border border-dashed py-8 text-center">
          <Text size="sm">لا يوجد منوبين بعد</Text>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map((client) => (
            <div
              key={client.id}
              className="group flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              onClick={() => {
                globalSheet.openClientDetails({
                  slug: 'clients',
                  clientId: client.id,
                  size: 'md',
                })
              }}
            >
              <div className="min-w-0 flex-1 space-y-2">
                <div className="space-y-1">
                  <Text weight="medium" className="line-clamp-1 text-sm">
                    {client.name}
                  </Text>
                  <EntityBadge type="entityType" value={client.clientType} className="text-xs" />
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {client.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span dir="ltr">{client.phone}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span className="truncate" dir="ltr">
                        {client.email}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
