import { useFormContext, Controller } from 'react-hook-form'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { cn } from '@/utils/cn'

/**
 * FormField wraps react-hook-form Controller with shadcn/ui Input + Label.
 * Must be used inside a <FormProvider> from react-hook-form.
 */
const FormField = ({
  name,
  label,
  type = 'text',
  placeholder,
  className,
  inputClassName,
  required,
  disabled,
  ...rest
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext()

  const error = errors[name]

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label htmlFor={name}>
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(error && 'border-destructive focus-visible:ring-destructive', inputClassName)}
            {...field}
            {...rest}
          />
        )}
      />
      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  )
}

export default FormField
