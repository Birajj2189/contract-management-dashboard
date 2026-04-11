import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import RegisterForm from '@/features/auth/components/RegisterForm'
import { useRegister } from '@/features/auth/hooks/useAuthMutations'
import AuthLayout from '@/components/layout/AuthLayout'
import { cn } from '@/utils/cn'

const RegisterPage = () => {
  const registerMutation = useRegister()

  const serverError =
    registerMutation.isError && registerMutation.error?.response
      ? registerMutation.error.response.data?.error?.message ||
        'We could not create your account. Check your details and try again.'
      : null

  return (
    <AuthLayout>
      <div
        className={cn(
          'rounded-2xl border border-border/60 bg-card/95 p-8 shadow-lg shadow-foreground/5',
          'backdrop-blur-sm dark:bg-card/90 dark:shadow-black/20',
          'sm:p-10'
        )}
      >
        <Link
          to="/login"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to sign in
        </Link>

        <div className="mb-8 space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Create your account
          </h1>
          <p className="text-base text-muted-foreground">
            New here? Set up access to manage contracts with your team.
          </p>
        </div>

        <RegisterForm
          onSubmit={(data) => registerMutation.mutate(data)}
          isLoading={registerMutation.isPending}
          serverError={serverError}
          onClearServerError={() => registerMutation.reset()}
        />
      </div>
    </AuthLayout>
  )
}

export default RegisterPage
