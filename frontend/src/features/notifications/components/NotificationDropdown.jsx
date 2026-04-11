import { useSelector, useDispatch } from 'react-redux'
import {
  selectNotifications,
  selectUnreadCount,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
} from '@/store/slices/notificationsSlice'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Button } from '@/components/ui/Button'
import NotificationItem from './NotificationItem'
import { Bell } from 'lucide-react'
import AnimatedDropdownSurface from '@/components/motion/AnimatedDropdownSurface'

const NotificationDropdown = ({ children }) => {
  const dispatch = useDispatch()
  const notifications = useSelector(selectNotifications)
  const unreadCount = useSelector(selectUnreadCount)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-80 border bg-popover p-0 text-popover-foreground shadow-lg data-[state=closed]:animate-none data-[state=open]:animate-none"
      >
        <AnimatedDropdownSurface>
        <DropdownMenuLabel>
          <div className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs font-normal text-primary"
                onClick={() => dispatch(markAllAsRead())}
              >
                Mark all read
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="max-h-[320px] overflow-y-auto">
            {notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkRead={(id) => dispatch(markAsRead(id))}
              />
            ))}
          </div>
        )}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground"
                onClick={() => dispatch(clearAllNotifications())}
              >
                Clear all
              </Button>
            </div>
          </>
        )}
        </AnimatedDropdownSurface>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NotificationDropdown
