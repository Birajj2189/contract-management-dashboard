import { formatRelative } from '@/utils/formatDate'
import { cn } from '@/utils/cn'
import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react'

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  default: Bell,
}

const colorMap = {
  success: 'text-green-600',
  error: 'text-destructive',
  info: 'text-primary',
  default: 'text-muted-foreground',
}

const NotificationItem = ({ notification, onMarkRead }) => {
  const Icon = iconMap[notification.type] || iconMap.default
  const iconColor = colorMap[notification.type] || colorMap.default

  return (
    <div
      className={cn(
        'flex cursor-pointer gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50',
        !notification.read && 'bg-primary/5'
      )}
      onClick={() => onMarkRead(notification.id)}
    >
      <div className={cn('mt-0.5 shrink-0', iconColor)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm', !notification.read && 'font-medium')}>{notification.title}</p>
        {notification.message && (
          <p className="mt-0.5 text-xs text-muted-foreground">{notification.message}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{formatRelative(notification.createdAt)}</p>
      </div>
      {!notification.read && (
        <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
      )}
    </div>
  )
}

export default NotificationItem
