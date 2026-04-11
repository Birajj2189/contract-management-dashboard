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

const inputClass =
  'h-11 rounded-lg border-border/80 bg-background/80 shadow-sm transition-shadow focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20'

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must include an uppercase letter')
      .regex(/[0-9]/, 'Must include a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

const RegisterForm = ({ onSubmit, isLoading, serverError, onClearServerError }) => {
  const methods = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    mode: 'onTouched',
  })

  const name = useWatch({ control: methods.control, name: 'name' })
  const email = useWatch({ control: methods.control, name: 'email' })
  const password = useWatch({ control: methods.control, name: 'password' })
  const confirmPassword = useWatch({ control: methods.control, name: 'confirmPassword' })
  const skipClearRef = useRef(true)

  useEffect(() => {
    if (skipClearRef.current) {
      skipClearRef.current = false
      return
    }
    if (serverError) onClearServerError?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, email, password, confirmPassword])

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {serverError ? (
          <div
            className="flex gap-3 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive dark:bg-destructive/15"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p>{serverError}</p>
          </div>
        ) : null}

        <FormField
          name="name"
          label="Full name"
          placeholder="Jane Cooper"
          required
          autoComplete="name"
          inputClassName={inputClass}
        />
        <FormField
          name="email"
          label="Email"
          type="email"
          placeholder="you@company.com"
          required
          autoComplete="email"
          inputClassName={inputClass}
        />
        <AuthPasswordField
          name="password"
          label="Password"
          placeholder="Create a strong password"
          required
          autoComplete="new-password"
        />
        <AuthPasswordField
          name="confirmPassword"
          label="Confirm password"
          placeholder="Repeat password"
          required
          autoComplete="new-password"
        />

        <p className="text-xs text-muted-foreground">
          Use at least 8 characters with one uppercase letter and one number.
        </p>

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
              Creating account…
            </>
          ) : (
            'Create account'
          )}
        </Button>

        <p className="pt-1 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/90 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </FormProvider>
  )
}

export default RegisterForm
