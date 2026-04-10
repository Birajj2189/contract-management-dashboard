import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Button } from '@/components/ui/Button'
import { Eye, MoreHorizontal, Pencil, Power, PowerOff } from 'lucide-react'

/**
 * Row actions for user management (admin-only callers).
 */
const UserActionsDropdown = ({
  user,
  currentUserId,
  canManage,
  onView,
  onEditRole,
  onToggleStatus,
}) => {
  const isSelf = user.id === currentUserId
  const disableStatus = isSelf || !canManage
  const disableRole = !canManage

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={`Actions for ${user.name}`}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          className="cursor-pointer gap-2"
          onSelect={(e) => {
            e.preventDefault()
            onView(user)
          }}
        >
          <Eye className="h-4 w-4" />
          View details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer gap-2"
          disabled={disableRole}
          onSelect={(e) => {
            e.preventDefault()
            if (!disableRole) onEditRole(user)
          }}
        >
          <Pencil className="h-4 w-4" />
          Edit role
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer gap-2"
          disabled={disableStatus}
          onSelect={(e) => {
            e.preventDefault()
            if (!disableStatus) onToggleStatus(user)
          }}
        >
          {user.isActive ? (
            <>
              <PowerOff className="h-4 w-4 text-destructive" />
              Deactivate
            </>
          ) : (
            <>
              <Power className="h-4 w-4 text-emerald-600" />
              Activate
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserActionsDropdown
