import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { PanelLeftClose, PanelLeftOpen, FileText as LogoIcon } from 'lucide-react'
import { cn } from '@/utils/cn'
import { selectUserRole, selectIsAuthenticated } from '@/store/slices/authSlice'
import { selectSidebarCollapsed, toggleSidebarCollapsed } from '@/store/slices/uiSlice'
import { Button } from '@/components/ui/Button'
import { Separator } from '@/components/ui/Separator'
import { Kbd } from '@/components/ui/Kbd'
import { mainNavItems, adminNavItems } from '@/config/navigation'
import { isMacLike } from '@/utils/platform'

const NavItem = ({ to, label, icon: Icon, collapsed, onNavigate, goKey, showShortcutHints }) => (
  <NavLink
    to={to}
    end={to === '/dashboard'}
    title={collapsed ? `${label} · G then ${goKey.toUpperCase()}` : undefined}
    onClick={() => onNavigate?.()}
    className={({ isActive }) =>
      cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-colors duration-150',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'hover:bg-accent/80 hover:text-accent-foreground',
        isActive
          ? cn(
              'bg-primary/12 text-primary shadow-sm',
              !collapsed &&
                'before:absolute before:left-0 before:top-1/2 before:h-6 before:w-1 before:-translate-y-1/2 before:rounded-r-full before:bg-primary'
            )
          : 'text-muted-foreground'
      )
    }
  >
    <Icon
      className={cn(
        'h-[1.125rem] w-[1.125rem] shrink-0 text-current',
        collapsed && 'mx-auto'
      )}
    />
    {!collapsed && (
      <>
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {showShortcutHints && goKey && (
          <span className="hidden items-center gap-0.5 lg:inline-flex" aria-hidden>
            <Kbd>G</Kbd>
            <Kbd>{goKey}</Kbd>
          </span>
        )}
      </>
    )}
  </NavLink>
)

/**
 * @param {'desktop' | 'sheet'} mode
 * @param {() => void} [onNavigate]
 * @param {() => void} [onOpenShortcutHelp] — desktop: opens keyboard help dialog
 */
const Sidebar = ({ mode = 'desktop', onNavigate, onOpenShortcutHelp, className }) => {
  const dispatch = useDispatch()
  const role = useSelector(selectUserRole)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const collapsedDesktop = useSelector(selectSidebarCollapsed)
  const isAdmin = role === 'ADMIN'
  const isSheet = mode === 'sheet'
  const collapsed = !isSheet && collapsedDesktop
  const showShortcutHints = !isSheet && !collapsed
  const modKey = isMacLike() ? '⌘' : 'Ctrl'

  if (!isAuthenticated) return null

  return (
    <aside
      className={cn(
        'flex h-full min-h-0 flex-col',
        isSheet ? 'w-full bg-background' : cn('w-60 bg-card/80 lg:bg-transparent', collapsed && 'w-[4.5rem]'),
        className
      )}
    >
      <div
        className={cn(
          'flex shrink-0 border-b border-border/60',
          isSheet && 'min-h-14 items-center gap-2 pl-3 pr-14',
          !isSheet && collapsed && 'flex-col items-center gap-2 px-2 py-3',
          !isSheet && !collapsed && 'h-14 items-center gap-2 px-3'
        )}
      >
        <div
          className={cn(
            'flex items-center gap-2.5',
            isSheet && 'min-w-0 flex-1',
            !isSheet && collapsed && 'flex-col gap-2',
            !isSheet && !collapsed && 'min-w-0 flex-1'
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <LogoIcon className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 overflow-hidden">
              <span className="block truncate text-sm font-semibold tracking-tight">ContractHub</span>
              {isSheet && (
                <span className="block truncate text-xs text-muted-foreground">Contract management</span>
              )}
            </div>
          )}
        </div>
        {!isSheet && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-accent/80"
            onClick={() => dispatch(toggleSidebarCollapsed())}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" aria-hidden />
            ) : (
              <PanelLeftClose className="h-4 w-4" aria-hidden />
            )}
          </Button>
        )}
      </div>

      <nav
        className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden p-2.5 pt-3 scrollbar-thin"
        aria-label="Main navigation"
      >
        {mainNavItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            label={item.label}
            icon={item.icon}
            goKey={item.goKey}
            collapsed={collapsed}
            onNavigate={onNavigate}
            showShortcutHints={showShortcutHints}
          />
        ))}

        {isAdmin && (
          <>
            <Separator className="my-2.5 bg-border/60" />
            {!collapsed && (
              <p className="mb-1 px-3 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground/70">
                Admin
              </p>
            )}
            {adminNavItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                goKey={item.goKey}
                collapsed={collapsed}
                onNavigate={onNavigate}
                showShortcutHints={showShortcutHints}
              />
            ))}
          </>
        )}
      </nav>

      {isSheet && (
        <div className="shrink-0 border-t border-border/60 bg-muted/20 px-4 py-3">
          <p className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">On desktop:</span> press{' '}
            <Kbd className="align-middle">{modKey}</Kbd>
            <Kbd className="align-middle">/</Kbd> for shortcuts, or{' '}
            <Kbd className="align-middle">G</Kbd> then a letter to jump to a section.
          </p>
        </div>
      )}

      {!isSheet && !collapsed && onOpenShortcutHelp && (
        <div className="shrink-0 border-t border-border/60 bg-muted/10 p-3">
          <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground/80">
            Keyboard
          </p>
          <p className="mb-2 text-xs text-muted-foreground">
            Press <Kbd className="align-middle">G</Kbd> then a key, or{' '}
            <Kbd className="align-middle">{modKey}</Kbd>
            <Kbd className="align-middle">/</Kbd> for the full list.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-full text-xs"
            onClick={onOpenShortcutHelp}
          >
            View shortcuts
          </Button>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
