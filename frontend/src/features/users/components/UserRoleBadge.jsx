import { cn } from '@/utils/cn'

const roleStyles = {
  ADMIN:
    'border-blue-300 bg-blue-100 text-blue-950 shadow-sm dark:border-blue-600 dark:bg-blue-950/80 dark:text-blue-50',
  USER:
    'border-slate-300 bg-slate-100 text-slate-800 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100',
}

export function UserRoleBadge({ role, className }) {
  const r = role === 'ADMIN' ? 'ADMIN' : 'USER'
  return (
    <span
      className={cn(
        'inline-flex min-h-[1.5rem] items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-tight',
        roleStyles[r],
        className
      )}
    >
      {r === 'ADMIN' ? 'Admin' : 'User'}
    </span>
  )
}
