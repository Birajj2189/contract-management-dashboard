import { getStatusClasses, STATUS_LABELS } from '@/utils/statusColors'
import { cn } from '@/utils/cn'

const StatusBadge = ({ status, className }) => {
  const label = STATUS_LABELS[status] || status

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        getStatusClasses(status),
        className
      )}
    >
      {label}
    </span>
  )
}

export default StatusBadge
