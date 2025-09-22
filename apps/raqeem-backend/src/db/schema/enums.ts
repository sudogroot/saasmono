import { pgEnum } from 'drizzle-orm/pg-core'

export const clientTypeEnum = pgEnum('opponent_type', [
  'individual',
  'company',
  'institution',
  'organization',
  'government',
  'association',
])

// Case Management
export const caseStatusEnum = pgEnum('case_status', [
  'new',
  'under-review',
  'filed-to-court',
  'under-consideration',
  'won',
  'lost',
  'postponed',
  'closed',
  'withdrawn',
  'suspended',
])

export const priorityEnum = pgEnum('priority', ['low', 'normal', 'medium', 'high', 'urgent', 'critical'])
