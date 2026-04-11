import LoginForm from '@/features/auth/components/LoginForm'
import { useLogin } from '@/features/auth/hooks/useAuthMutations'
import AuthLayout from '@/components/layout/AuthLayout'
import { cn } from '@/utils/cn'

const LoginPage = () => {
  const loginMutation = useLogin()

  const serverError = loginMutation.isError && loginMutation.error?.response != null

  return (
    <AuthLayout>
      <div
        className={cn(
          'rounded-2xl border border-border/60 bg-card/95 p-8 shadow-lg shadow-foreground/5',
          'backdrop-blur-sm dark:bg-card/90 dark:shadow-black/20',
          'sm:p-10'
        )}
      >
        <div className="mb-8 space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome back
          </h1>
          <p className="text-base text-muted-foreground">
            Sign in to continue to your workspace and contracts.
          </p>
        </div>

        <LoginForm
          onSubmit={(data) => loginMutation.mutate(data)}
          isLoading={loginMutation.isPending}
          serverError={serverError}
          onClearServerError={() => loginMutation.reset()}
        />
      </div>
    </AuthLayout>
  )
}

export default LoginPage
