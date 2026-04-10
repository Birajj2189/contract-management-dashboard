import { cn } from '@/utils/cn'

export function UserStatusBadge({ isActive, className }) {
  return (
    <span
      className={cn(
        'inline-flex min-h-[1.5rem] items-center rounded-full border px-3 py-1 text-xs font-bold tracking-tight',
        isActive
          ? 'border-emerald-300 bg-emerald-100 text-emerald-950 shadow-sm dark:border-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-50'
          : 'border-red-300 bg-red-100 text-red-950 shadow-sm dark:border-red-700 dark:bg-red-950/80 dark:text-red-50',
        className
      )}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}
