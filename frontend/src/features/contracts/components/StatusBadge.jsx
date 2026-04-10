import { getStatusClasses, STATUS_LABELS } from '@/utils/statusColors'
import { cn } from '@/utils/cn'

const StatusBadge = ({ status, className }) => {
  const label = STATUS_LABELS[status] || status

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold tracking-tight',
        getStatusClasses(status),
        className
      )}
    >
      {label}
    </span>
  )
}

export default StatusBadge
