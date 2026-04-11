import PageWrapper from '@/components/layout/PageWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { UserRoleBadge } from '@/features/users/components/UserRoleBadge'
import { UserStatusBadge } from '@/features/users/components/UserStatusBadge'
import { useAuth } from '@/hooks/useAuth'
import { Separator } from '@/components/ui/Separator'
import { formatDate } from '@/utils/formatDate'

const AccountPage = () => {
  const { user } = useAuth()

  if (!user) return null

  return (
    <PageWrapper
      title="Account"
      description="Your sign-in identity and role in this workspace. Use the header menu to sign out."
    >
      <div className="mx-auto w-full max-w-lg">
        <Card className="border-border/70 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Profile</CardTitle>
            <CardDescription>Information from your current session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</p>
              <p className="mt-1 text-sm font-medium text-foreground">{user.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
              <p className="mt-1 text-sm text-foreground">{user.email}</p>
            </div>
            <Separator />
            <div className="flex flex-wrap items-center gap-2">
              <UserRoleBadge role={user.role} />
              <UserStatusBadge isActive={user.isActive !== false} />
            </div>
            {user.createdAt && (
              <p className="text-xs text-muted-foreground">
                Member since {formatDate(user.createdAt)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}

export default AccountPage
