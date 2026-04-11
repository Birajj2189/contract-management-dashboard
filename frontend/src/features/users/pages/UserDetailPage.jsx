import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Pencil } from 'lucide-react'
import PageWrapper from '@/components/layout/PageWrapper'
import { Button, buttonVariants } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Separator } from '@/components/ui/Separator'
import { UserRoleBadge } from '@/features/users/components/UserRoleBadge'
import { UserStatusBadge } from '@/features/users/components/UserStatusBadge'
import EditUserRoleDialog from '@/features/users/components/EditUserRoleDialog'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useUserDetail } from '@/features/users/hooks/useUserDetail'
import { useUpdateUser } from '@/features/users/hooks/useUserMutations'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'

const UserDetailPage = () => {
  const { userId } = useParams()
  const reduceMotion = useReducedMotion()
  const { user: currentUser, isAdmin } = useAuth()
  const { data: user, isLoading, isError, error, refetch } = useUserDetail(userId)
  const { mutateAsync: patchUser, isPending: isStatusPending } = useUpdateUser()
  const [roleOpen, setRoleOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)

  const isSelf = user && currentUser && user.id === currentUser.id
  const canManage = isAdmin

  const handleStatusConfirm = async () => {
    if (!user) return
    const next = !user.isActive
    try {
      await patchUser({ userId: user.id, body: { isActive: next } })
      toast.success(next ? 'User activated.' : 'User deactivated.')
      setStatusOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not update status.')
    }
  }

  if (isLoading) {
    return (
      <PageWrapper backFallback="/users" className="mx-auto max-w-3xl" title="User" description="">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </PageWrapper>
    )
  }

  if (isError || !user) {
    return (
      <PageWrapper
        backFallback="/users"
        className="mx-auto max-w-3xl"
        title="User not found"
        description="This account may have been removed."
        actions={
          <Link to="/users" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
            Back to users
          </Link>
        }
      >
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {error?.response?.data?.error?.message || error?.message || 'Unable to load this user.'}
          <Button type="button" variant="outline" size="sm" className="ml-3 h-8" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper
      backFallback="/users"
      className="mx-auto max-w-3xl"
      title={user.name}
      description={user.email}
      actions={
        <Link to="/users" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
          All users
        </Link>
      }
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Profile</CardTitle>
            <CardDescription>Role, status, and account dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <UserRoleBadge role={user.role} />
              <UserStatusBadge isActive={user.isActive} />
            </div>
            <Separator />
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Joined</dt>
                <dd className="font-medium tabular-nums">{formatDate(user.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Last updated</dt>
                <dd className="font-medium tabular-nums">{formatDate(user.updatedAt)}</dd>
              </div>
            </dl>
            {canManage && (
              <>
                <Separator />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => setRoleOpen(true)}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit role
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={user.isActive ? 'destructive' : 'default'}
                    onClick={() => setStatusOpen(true)}
                    disabled={isSelf && user.isActive}
                    title={isSelf && user.isActive ? 'You cannot deactivate your own account' : undefined}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
                {isSelf && user.isActive && (
                  <p className="text-xs text-muted-foreground">
                    You cannot deactivate your own account from here.
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <EditUserRoleDialog user={user} open={roleOpen} onOpenChange={setRoleOpen} />
      <ConfirmDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        title={user.isActive ? 'Deactivate user?' : 'Activate user?'}
        description={
          user.isActive
            ? `${user.name} will not be able to sign in until reactivated.`
            : `${user.name} will be able to sign in again.`
        }
        confirmLabel={user.isActive ? 'Deactivate' : 'Activate'}
        variant={user.isActive ? 'destructive' : 'default'}
        onConfirm={handleStatusConfirm}
        isLoading={isStatusPending}
      />
    </PageWrapper>
  )
}

export default UserDetailPage
