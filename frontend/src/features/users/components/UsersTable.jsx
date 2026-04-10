import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import UserRow from '@/features/users/components/UserRow'
import UserEmptyState from '@/features/users/components/UserEmptyState'

/**
 * @param {object[]} rows
 * @param {'no-data' | 'no-match' | null} emptyVariant
 */
const UsersTable = ({
  rows,
  emptyVariant,
  onClearFilters,
  onAddUser,
  currentUserId,
  canManage,
  onRowClick,
  onView,
  onEditRole,
  onToggleStatus,
}) => (
  <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
    <Table>
      <TableHeader>
        <TableRow className="border-border/60 hover:bg-transparent">
          <TableHead className="min-w-[120px]">Name</TableHead>
          <TableHead className="min-w-[160px]">Email</TableHead>
          <TableHead className="w-[120px] whitespace-nowrap">Role</TableHead>
          <TableHead className="w-[110px] whitespace-nowrap">Status</TableHead>
          <TableHead className="w-[120px] whitespace-nowrap">Joined</TableHead>
          <TableHead className="w-14 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {emptyVariant ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={6} className="h-auto p-0">
              <UserEmptyState
                variant={emptyVariant}
                onClearFilters={onClearFilters}
                onAddUser={emptyVariant === 'no-data' ? onAddUser : undefined}
                className="border-0 rounded-none"
              />
            </TableCell>
          </TableRow>
        ) : (
          rows.map((u) => (
            <UserRow
              key={u.id}
              user={u}
              currentUserId={currentUserId}
              canManage={canManage}
              onRowClick={onRowClick}
              onView={onView}
              onEditRole={onEditRole}
              onToggleStatus={onToggleStatus}
            />
          ))
        )}
      </TableBody>
    </Table>
  </div>
)

export default UsersTable
