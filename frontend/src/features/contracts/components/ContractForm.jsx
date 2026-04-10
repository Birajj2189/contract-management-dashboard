import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import FormField from '@/components/forms/FormField'
import FormSelect from '@/components/forms/FormSelect'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { useFormContext, Controller } from 'react-hook-form'
import { STATUS_OPTIONS } from '@/utils/statusColors'
import { cn } from '@/utils/cn'

const contractSchema = z
  .object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    description: z.string().optional(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    status: z.enum(['DRAFT', 'ACTIVE', 'EXECUTED', 'EXPIRED']).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate)
      }
      return true
    },
    { message: 'End date must be on or after start date', path: ['endDate'] }
  )

const TextareaField = ({ name, label, placeholder, required, className }) => {
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
          <Textarea
            id={name}
            placeholder={placeholder}
            className={cn(error && 'border-destructive focus-visible:ring-destructive')}
            {...field}
          />
        )}
      />
      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  )
}

const ContractForm = ({ defaultValues, onSubmit, isLoading, isEdit = false }) => {
  const methods = useForm({
    resolver: zodResolver(contractSchema),
    defaultValues: defaultValues || {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'DRAFT',
    },
  })

  const statusOptions = isEdit ? STATUS_OPTIONS : STATUS_OPTIONS.filter((s) => s.value === 'DRAFT')

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormField
          name="title"
          label="Contract title"
          placeholder="Service Agreement 2024"
          required
        />
        <TextareaField
          name="description"
          label="Description"
          placeholder="Brief description of this contract..."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField name="startDate" label="Start date" type="date" required />
          <FormField name="endDate" label="End date" type="date" required />
        </div>
        {isEdit && (
          <FormSelect name="status" label="Status" options={statusOptions} required />
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => history.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEdit ? 'Update contract' : 'Create contract'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

export default ContractForm
