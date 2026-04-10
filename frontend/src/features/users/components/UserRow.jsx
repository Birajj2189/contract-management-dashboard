import { memo } from 'react'
import { TableCell, TableRow } from '@/components/ui/Table'
import { formatDate } from '@/utils/formatDate'
import { UserRoleBadge } from '@/features/users/components/UserRoleBadge'
import { UserStatusBadge } from '@/features/users/components/UserStatusBadge'
import UserActionsDropdown from '@/features/users/components/UserActionsDropdown'

const UserRow = memo(function UserRow({
  user,
  currentUserId,
  canManage,
  onRowClick,
  onView,
  onEditRole,
  onToggleStatus,
}) {
  const activateRow = () => onRowClick(user)

  return (
    <TableRow
      tabIndex={0}
      className="cursor-pointer border-border/50 transition-colors hover:bg-muted/70 focus-visible:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      onClick={activateRow}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          activateRow()
        }
      }}
    >
      <TableCell className="max-w-[min(200px,40vw)] font-medium text-foreground">
        <span className="line-clamp-2">{user.name}</span>
      </TableCell>
      <TableCell className="max-w-[min(240px,50vw)] text-muted-foreground">
        <span className="line-clamp-2">{user.email}</span>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <UserRoleBadge role={user.role} />
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <UserStatusBadge isActive={user.isActive} />
      </TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground tabular-nums">
        {formatDate(user.createdAt)}
      </TableCell>
      <TableCell className="w-14 text-right" onClick={(e) => e.stopPropagation()}>
        <UserActionsDropdown
          user={user}
          currentUserId={currentUserId}
          canManage={canManage}
          onView={onView}
          onEditRole={onEditRole}
          onToggleStatus={onToggleStatus}
        />
      </TableCell>
    </TableRow>
  )
})

export default UserRow
