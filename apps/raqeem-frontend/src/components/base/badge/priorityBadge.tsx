import { Badge } from './badge'
// import { casePriorityBadges, type CasePriority } from './types';

export function PriorityBadge({ priority }: { priority: any }) {
  // If config is provided, use it for styling and content
  // const badgeConfig = casePriorityBadges[priority];
  return <Badge className="w-[79px]" />
}
// config={badgeConfig}
