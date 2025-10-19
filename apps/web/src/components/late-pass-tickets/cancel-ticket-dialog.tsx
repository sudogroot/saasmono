'use client'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Textarea,
} from '@repo/ui'
import { useState } from 'react'

interface CancelTicketDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => void
  ticketNumber: string
  isPending?: boolean
}

export function CancelTicketDialog({
  open,
  onOpenChange,
  onConfirm,
  ticketNumber,
  isPending = false,
}: CancelTicketDialogProps) {
  const [reason, setReason] = useState('')

  const handleConfirm = () => {
    onConfirm(reason || 'لا يوجد سبب محدد')
    setReason('')
    onOpenChange(false)
  }

  const handleCancel = () => {
    setReason('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إلغاء التذكرة</DialogTitle>
          <DialogDescription>
            هل أنت متأكد من إلغاء التذكرة{' '}
            <span className="font-mono font-medium">{ticketNumber}</span>؟
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label htmlFor="reason" className="text-sm font-medium">
            سبب الإلغاء (اختياري)
          </label>
          <Textarea
            id="reason"
            placeholder="اكتب سبب إلغاء التذكرة..."
            value={reason}
            onChange={(e) => setReason(e.target.value.slice(0, 500))}
            disabled={isPending}
            rows={4}
          />
          <div className="text-xs text-muted-foreground text-left">
            {reason.length}/500
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isPending}>
            رجوع
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? 'جاري الإلغاء...' : 'تأكيد الإلغاء'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
