import { cn } from '@/utils/cn'

/**
 * Pulse placeholder for loading layouts. Use inside tables, cards, and page shells.
 */
const Skeleton = ({ className, ...props }) => (
  <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />
)

export { Skeleton }
