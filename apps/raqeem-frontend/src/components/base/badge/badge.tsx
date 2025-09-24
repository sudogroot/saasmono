import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import * as LucideIcons from 'lucide-react'
// import type { BadgeConfig } from '@/types';
import { Badge as BadgeComponent } from '@repo/ui'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  config?: any
  showIcon?: boolean
}

function Badge({ className, variant, config, showIcon = true, children, ...props }: BadgeProps) {
  // If config is provided, use it for styling and content
  if (config) {
    const IconComponent = showIcon ? (LucideIcons as any)[config.icon] : null

    return (
      <BadgeComponent
        dir="rtl"
        className={cn(
          `flex items-center justify-center bg-${config.badge}-50 text-${config.badge}-700 border-${config.badge}-200`,
          className
        )}
        variant="outline"
        {...props}
      >
        <div>
          {IconComponent && <IconComponent className={`h-3 w-3 justify-end self-end text-${config.badge}-700`} />}
        </div>
        <div className="flex-1 self-center">{config.title}</div>
      </BadgeComponent>
    )
  }

  // Fallback to default badge styling
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
