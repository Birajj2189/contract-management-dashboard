import { useEffect, useRef } from 'react'
import { useForm, FormProvider, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Loader2, AlertCircle } from 'lucide-react'
import FormField from '@/components/forms/FormField'
import AuthPasswordField from '@/features/auth/components/AuthPasswordField'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

const LoginForm = ({ onSubmit, isLoading, serverError, onClearServerError }) => {
  const methods = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  })

  const email = useWatch({ control: methods.control, name: 'email' })
  const password = useWatch({ control: methods.control, name: 'password' })
  const skipClearRef = useRef(true)

  useEffect(() => {
    if (skipClearRef.current) {
      skipClearRef.current = false
      return
    }
    if (serverError) onClearServerError?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- clear only when credentials change after a failed attempt
  }, [email, password])

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {serverError ? (
          <div
            className="flex gap-3 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive dark:bg-destructive/15"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p>
              Unable to sign in. Check your email and password and try again.
            </p>
          </div>
        ) : null}

        <FormField
          name="email"
          label="Email"
          type="email"
          placeholder="you@company.com"
          required
          autoComplete="email"
          inputClassName="h-11 rounded-lg border-border/80 bg-background/80 shadow-sm transition-shadow focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
        />
        <AuthPasswordField
          name="password"
          label="Password"
          placeholder="Enter your password"
          required
          autoComplete="current-password"
        />

        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className={cn(
            'h-11 w-full rounded-lg text-base font-semibold shadow-md transition-all',
            'hover:shadow-lg active:scale-[0.99] active:shadow-md'
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </Button>

        <p className="pt-1 text-center text-sm text-muted-foreground">
          New here?{' '}
          <Link
            to="/register"
            className="font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/90 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </form>
    </FormProvider>
  )
}

export default LoginForm
