import { useState } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

/**
 * Password field with show/hide toggle for auth flows.
 */
const AuthPasswordField = ({
  name,
  label,
  placeholder,
  required,
  autoComplete,
  className,
}) => {
  const [visible, setVisible] = useState(false)
  const {
    control,
    formState: { errors },
  } = useFormContext()

  const error = errors[name]

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="relative">
            <Input
              id={name}
              type={visible ? 'text' : 'password'}
              placeholder={placeholder}
              autoComplete={autoComplete}
              className={cn(
                'h-11 rounded-lg border-border/80 bg-background/80 pr-11 shadow-sm transition-shadow',
                'focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20',
                error && 'border-destructive focus-visible:ring-destructive/25'
              )}
              {...field}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0.5 top-1/2 h-9 w-9 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? 'Hide password' : 'Show password'}
            >
              {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        )}
      />
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
    </div>
  )
}

export default AuthPasswordField
