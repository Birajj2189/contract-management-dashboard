import { useFormContext, Controller } from 'react-hook-form'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { cn } from '@/utils/cn'

/**
 * FormSelect wraps react-hook-form Controller with shadcn/ui Select + Label.
 * @param {Array} options - [{ value, label }]
 */
const FormSelect = ({
  name,
  label,
  placeholder = 'Select...',
  options = [],
  className,
  required,
  disabled,
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
          <Select
            onValueChange={field.onChange}
            value={field.value || ''}
            disabled={disabled}
          >
            <SelectTrigger
              id={name}
              className={cn(error && 'border-destructive focus:ring-destructive')}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  )
}

export default FormSelect
