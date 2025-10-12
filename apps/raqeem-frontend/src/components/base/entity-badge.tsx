import { cn } from '@/lib/utils'
import { Badge, Text } from '@repo/ui'
import type { LucideIcon } from 'lucide-react'
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  CheckCircle,
  Circle,
  CircleDot,
  Clock,
  FileText,
  Flame,
  Landmark,
  Pause,
  Scale,
  ShieldAlert,
  UserCircle,
  Users,
  XCircle,
} from 'lucide-react'

// ============================================================================
// Badge Configuration Types
// ============================================================================

type BadgeConfig = {
  label: string
  colorClass: string
  icon?: LucideIcon
}

// ============================================================================
// Case Status Badges
// ============================================================================

const CASE_STATUS_CONFIG: Record<string, BadgeConfig> = {
  new: {
    label: 'جديدة',
    colorClass: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Circle,
  },
  'under-review': {
    label: 'قيد المراجعة',
    colorClass: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: FileText,
  },
  'filed-to-court': {
    label: 'مرفوعة للمحكمة',
    colorClass: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Scale,
  },
  'under-consideration': {
    label: 'قيد النظر',
    colorClass: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: Clock,
  },
  won: {
    label: 'كسبت',
    colorClass: 'bg-green-50 text-green-700 border-green-200',
    icon: CheckCircle,
  },
  lost: {
    label: 'خسرت',
    colorClass: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircle,
  },
  postponed: {
    label: 'مؤجلة',
    colorClass: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: Pause,
  },
  closed: {
    label: 'مغلقة',
    colorClass: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: CircleDot,
  },
  withdrawn: {
    label: 'منسحبة',
    colorClass: 'bg-pink-50 text-pink-700 border-pink-200',
    icon: AlertCircle,
  },
  suspended: {
    label: 'معلقة',
    colorClass: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: AlertTriangle,
  },
}

// ============================================================================
// Priority Badges
// ============================================================================

const PRIORITY_CONFIG: Record<string, BadgeConfig> = {
  low: {
    label: 'منخفضة',
    colorClass: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: Circle,
  },
  normal: {
    label: 'عادية',
    colorClass: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: CircleDot,
  },
  medium: {
    label: 'متوسطة',
    colorClass: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: AlertCircle,
  },
  high: {
    label: 'عالية',
    colorClass: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: AlertTriangle,
  },
  urgent: {
    label: 'عاجلة',
    colorClass: 'bg-red-50 text-red-700 border-red-200',
    icon: Flame,
  },
  critical: {
    label: 'حرجة',
    colorClass: 'bg-red-100 text-red-800 border-red-300',
    icon: ShieldAlert,
  },
}

// ============================================================================
// Entity Type Badges (used for both clients and opponents)
// ============================================================================

const ENTITY_TYPE_CONFIG: Record<string, BadgeConfig> = {
  individual: {
    label: 'فرد',
    colorClass: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: UserCircle,
  },
  company: {
    label: 'شركة',
    colorClass: 'bg-green-50 text-green-700 border-green-200',
    icon: Building2,
  },
  institution: {
    label: 'مؤسسة',
    colorClass: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Landmark,
  },
  organization: {
    label: 'منظمة',
    colorClass: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: Users,
  },
  government: {
    label: 'حكومي',
    colorClass: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: Landmark,
  },
  association: {
    label: 'جمعية',
    colorClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: Users,
  },
}

// ============================================================================
// Badge Type Enum
// ============================================================================

export type EntityBadgeType = 'caseStatus' | 'priority' | 'entityType'

// ============================================================================
// Component Props
// ============================================================================

interface EntityBadgeProps {
  type: EntityBadgeType
  value: string
  showIcon?: boolean
  className?: string
  iconClassName?: string
}

// ============================================================================
// Helper Function
// ============================================================================

function getBadgeConfig(type: EntityBadgeType, value: string): BadgeConfig | null {
  switch (type) {
    case 'caseStatus':
      return CASE_STATUS_CONFIG[value] || null
    case 'priority':
      return PRIORITY_CONFIG[value] || null
    case 'entityType':
      return ENTITY_TYPE_CONFIG[value] || null
    default:
      return null
  }
}

// ============================================================================
// EntityBadge Component
// ============================================================================

export function EntityBadge({ type, value, showIcon = true, className, iconClassName }: EntityBadgeProps) {
  const config = getBadgeConfig(type, value)

  if (!config) {
    return null
  }

  const Icon = config.icon

  return (
    <Badge dir="rtl" variant="outline" className={cn('font-medium', config.colorClass, className)}>
      <div className="flex items-center gap-1.5">
        {showIcon && Icon && <Icon className={cn('h-4.5 w-4.5 md:h-3.5 md:w-3.5', config.colorClass, iconClassName)} />}
        <Text size="xs" className={cn(config.colorClass)}>
          {config.label}
        </Text>
      </div>
    </Badge>
  )
}

// ============================================================================
// Export Configuration for Filters
// ============================================================================

export const ENTITY_BADGE_CONFIGS = {
  caseStatus: CASE_STATUS_CONFIG,
  priority: PRIORITY_CONFIG,
  entityType: ENTITY_TYPE_CONFIG,
}
