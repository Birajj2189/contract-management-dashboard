import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  LayoutDashboard,
  FileText,
  Users,
  UserCircle,
  BarChart3,
  ChevronLeft,
  FileText as LogoIcon,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { selectUserRole, selectIsAuthenticated } from '@/store/slices/authSlice'
import { selectSidebarCollapsed, toggleSidebarCollapsed } from '@/store/slices/uiSlice'
import { Button } from '@/components/ui/Button'
import { Separator } from '@/components/ui/Separator'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/contracts', label: 'Contracts', icon: FileText },
  { to: '/parties', label: 'Parties', icon: UserCircle },
]

const adminNavItems = [
  { to: '/users', label: 'Users', icon: Users },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
]

const NavItem = ({ to, label, icon: Icon, collapsed }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        isActive
          ? 'bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary'
          : 'text-muted-foreground'
      )
    }
  >
    <Icon className="h-4 w-4 shrink-0" />
    {!collapsed && <span>{label}</span>}
  </NavLink>
)

const Sidebar = () => {
  const dispatch = useDispatch()
  const role = useSelector(selectUserRole)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const collapsed = useSelector(selectSidebarCollapsed)
  const isAdmin = role === 'ADMIN'

  if (!isAuthenticated) return null

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-background transition-all duration-200',
        collapsed ? 'w-[60px]' : 'w-[220px]'
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b px-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <LogoIcon className="h-4 w-4" />
          </div>
          {!collapsed && (
            <span className="truncate text-sm font-semibold">ContractHub</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={() => dispatch(toggleSidebarCollapsed())}
        >
          <ChevronLeft
            className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
          />
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-2 pt-3">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}

        {isAdmin && (
          <>
            <Separator className="my-2" />
            {!collapsed && (
              <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                Admin
              </p>
            )}
            {adminNavItems.map((item) => (
              <NavItem key={item.to} {...item} collapsed={collapsed} />
            ))}
          </>
        )}
      </nav>
    </aside>
  )
}

export default Sidebar
