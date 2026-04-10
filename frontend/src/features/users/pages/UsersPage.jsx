import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { UserPlus } from 'lucide-react'
import PageWrapper from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import UserSearch from '@/features/users/components/UserSearch'
import UserFilters from '@/features/users/components/UserFilters'
import UsersTable from '@/features/users/components/UsersTable'
import UserPagination from '@/features/users/components/UserPagination'
import UserSkeleton from '@/features/users/components/UserSkeleton'
import UserStats from '@/features/users/components/UserStats'
import AddUserDialog from '@/features/users/components/AddUserDialog'
import EditUserRoleDialog from '@/features/users/components/EditUserRoleDialog'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useUsersList } from '@/features/users/hooks/useUsersList'
import { useUpdateUser } from '@/features/users/hooks/useUserMutations'
import { useDebounce } from '@/hooks/useDebounce'
import { useAuth } from '@/hooks/useAuth'
import env from '@/config/env'
import toast from 'react-hot-toast'

const UsersPage = () => {
  const reduceMotion = useReducedMotion()
  const navigate = useNavigate()
  const { user: currentUser, isAdmin } = useAuth()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [addOpen, setAddOpen] = useState(false)
  const [roleEditUser, setRoleEditUser] = useState(null)
  const [statusTarget, setStatusTarget] = useState(null)

  const debouncedSearch = useDebounce(search, env.debounceDelay)
  const { mutateAsync: patchUser, isPending: isStatusPending } = useUpdateUser()

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, roleFilter, statusFilter])

  const { data, isLoading, isFetching, isError, error, refetch } = useUsersList({
    search: debouncedSearch,
    role: roleFilter,
    status: statusFilter,
    page,
    limit: env.pageSize,
  })

  const users = data?.users ?? []
  const meta = data?.meta
  const stats = meta?.stats
  const totalFiltered = meta?.total ?? 0
  const totalPages = Math.max(1, meta?.totalPages ?? 1)

  const resetFilters = useCallback(() => {
    setSearch('')
    setRoleFilter('ALL')
    setStatusFilter('all')
    setPage(1)
  }, [])

  const handleRowClick = useCallback(
    (u) => {
      navigate(`/users/${u.id}`)
    },
    [navigate]
  )

  const handleView = useCallback(
    (u) => {
      navigate(`/users/${u.id}`)
    },
    [navigate]
  )

  const handleConfirmStatus = async () => {
    if (!statusTarget) return
    const next = !statusTarget.isActive
    try {
      await patchUser({ userId: statusTarget.id, body: { isActive: next } })
      toast.success(next ? 'User activated.' : 'User deactivated.')
      setStatusTarget(null)
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not update status.')
    }
  }

  const showFullSkeleton = isLoading && !data
  let emptyVariant = null
  if (!showFullSkeleton && !isError && data) {
    if (stats?.totalUsers === 0) emptyVariant = 'no-data'
    else if (totalFiltered === 0) emptyVariant = 'no-match'
  }

  const canManage = isAdmin

  return (
    <PageWrapper
      className="mx-auto w-full max-w-7xl"
      title="Users"
      description="Manage accounts, roles, and access for your organization."
      actions={
        canManage ? (
          <Button
            type="button"
            className="h-10 shrink-0 gap-2 rounded-lg px-4 text-sm font-semibold shadow-sm"
            onClick={() => setAddOpen(true)}
          >
            <UserPlus className="h-4 w-4 shrink-0" aria-hidden />
            Add user
          </Button>
        ) : null
      }
    >
      {isError && (
        <div
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          <span className="font-medium">Could not load users.</span>{' '}
          <span className="text-destructive/90">
            {error?.response?.data?.error?.message || error?.message || 'Try again in a moment.'}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-3 h-8 border-destructive/40"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </div>
      )}

      {showFullSkeleton ? (
        <UserSkeleton />
      ) : !isError ? (
        <>
          {stats && (
            <UserStats
              totalUsers={stats.totalUsers}
              activeUsers={stats.activeUsers}
              adminCount={stats.adminCount}
            />
          )}

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 rounded-2xl border border-border/60 bg-card/40 p-4 shadow-sm ring-1 ring-border/40 sm:p-6"
          >
            <div className="flex flex-col gap-4 border-b border-border/60 pb-4 transition-opacity duration-200 sm:flex-row sm:flex-wrap sm:items-end">
              <UserSearch value={search} onChange={setSearch} className="min-w-0 sm:min-w-[240px] sm:flex-[2]" />
              <UserFilters
                roleFilter={roleFilter}
                onRoleChange={setRoleFilter}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                totalForStatusLabel={stats?.totalUsers}
                className="sm:ml-auto"
              />
            </div>
            {isFetching && !showFullSkeleton && (
              <p className="text-xs text-muted-foreground" aria-live="polite">
                Updating results…
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              <span className="font-medium tabular-nums text-foreground">{totalFiltered}</span> matching{' '}
              {totalFiltered === 1 ? 'user' : 'users'}
            </p>
            <UsersTable
              rows={emptyVariant ? [] : users}
              emptyVariant={emptyVariant}
              onClearFilters={resetFilters}
              onAddUser={() => setAddOpen(true)}
              currentUserId={currentUser?.id}
              canManage={canManage}
              onRowClick={handleRowClick}
              onView={handleView}
              onEditRole={(u) => setRoleEditUser(u)}
              onToggleStatus={(u) => setStatusTarget(u)}
            />
            {!emptyVariant && (
              <UserPagination
                page={page}
                totalPages={totalPages}
                total={totalFiltered}
                pageSize={env.pageSize}
                onPageChange={setPage}
              />
            )}
          </motion.div>
        </>
      ) : null}

      <AddUserDialog open={addOpen} onOpenChange={setAddOpen} />
      <EditUserRoleDialog
        user={roleEditUser}
        open={Boolean(roleEditUser)}
        onOpenChange={(o) => !o && setRoleEditUser(null)}
      />
      <ConfirmDialog
        open={Boolean(statusTarget)}
        onOpenChange={(o) => !o && setStatusTarget(null)}
        title={statusTarget?.isActive ? 'Deactivate user?' : 'Activate user?'}
        description={
          statusTarget
            ? statusTarget.isActive
              ? `${statusTarget.name} will not be able to sign in until reactivated.`
              : `${statusTarget.name} will be able to sign in again.`
            : undefined
        }
        confirmLabel={statusTarget?.isActive ? 'Deactivate' : 'Activate'}
        variant={statusTarget?.isActive ? 'destructive' : 'default'}
        onConfirm={handleConfirmStatus}
        isLoading={isStatusPending}
      />
    </PageWrapper>
  )
}

export default UsersPage
