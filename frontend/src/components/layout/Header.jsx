import { useDispatch } from 'react-redux'
import { Menu, Bell, LogOut, User, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Badge } from '@/components/ui/Badge'
import { toggleSidebar } from '@/store/slices/uiSlice'
import { selectUnreadCount } from '@/store/slices/notificationsSlice'
import { useSelector } from 'react-redux'
import { useAuth } from '@/hooks/useAuth'
import NotificationDropdown from '@/features/notifications/components/NotificationDropdown'
import { Kbd } from '@/components/ui/Kbd'
import { cn } from '@/utils/cn'
import { isMacLike } from '@/utils/platform'

const iconButtonMobile =
  'h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 touch-manipulation lg:h-9 lg:w-9 lg:min-h-0 lg:min-w-0'

const Header = ({ className }) => {
  const dispatch = useDispatch()
  const { user, logout } = useAuth()
  const unreadCount = useSelector(selectUnreadCount)
  const modKey = isMacLike() ? '⌘' : 'Ctrl'

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <header
      className={cn(
        'sticky top-0 z-40 shrink-0 border-b border-border/60 bg-background/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/80',
        'pt-[max(0.25rem,env(safe-area-inset-top))]',
        className
      )}
    >
      <div
        className="flex min-h-[3.25rem] w-full max-w-full items-center gap-2 px-3 sm:gap-3 sm:px-4 lg:min-h-14 lg:px-6"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(iconButtonMobile, 'lg:hidden')}
          onClick={() => dispatch(toggleSidebar())}
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </Button>

        <div className="flex min-w-0 flex-1 items-center gap-2.5 lg:hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <FileText className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.9375rem] font-semibold leading-tight tracking-tight text-foreground">
              ContractHub
            </p>
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 items-center gap-2 lg:flex">
          <p className="line-clamp-1 text-xs text-muted-foreground">
            Signed in as{' '}
            <span className="font-medium text-foreground">{user?.name ?? 'User'}</span>
          </p>
          <span className="hidden shrink-0 items-center gap-1.5 text-[11px] text-muted-foreground/85 lg:inline-flex">
            <span className="sr-only">
              Open keyboard shortcut help: {modKey} plus slash.{' '}
            </span>
            <span className="text-muted-foreground/50" aria-hidden>
              ·
            </span>
            <span className="inline-flex items-center gap-0.5">
              <Kbd className="h-5 min-w-0 px-1 py-0 text-[10px]">{modKey}</Kbd>
              <Kbd className="h-5 min-w-0 px-1 py-0 text-[10px]">/</Kbd>
            </span>
            <span>shortcuts</span>
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <NotificationDropdown>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(iconButtonMobile, 'relative text-muted-foreground hover:text-foreground')}
              aria-label="Notifications"
            >
              <Bell className="h-6 w-6 lg:h-5 lg:w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full p-0 text-[10px]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </NotificationDropdown>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  iconButtonMobile,
                  'rounded-full ring-offset-background focus-visible:ring-2 focus-visible:ring-ring'
                )}
                aria-label="Account menu"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/12 text-xs font-semibold text-primary lg:h-8 lg:w-8">
                  {initials}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{user?.name}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" disabled>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export default Header
