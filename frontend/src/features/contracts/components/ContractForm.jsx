import { useForm, FormProvider, useFieldArray } from 'react-hook-form'
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
import { Plus, Trash2 } from 'lucide-react'

const partySchema = z.object({
  name: z.string().trim().min(1, 'Party name is required').max(200),
  email: z
    .string()
    .trim()
    .optional()
    .refine((s) => !s || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s), {
      message: 'Invalid email',
    }),
  role: z.string().trim().max(100).optional(),
})

const contractSchema = z
  .object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    description: z.string().optional(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    status: z.enum(['DRAFT', 'ACTIVE', 'EXECUTED', 'EXPIRED']).optional(),
    parties: z
      .array(partySchema)
      .min(1, 'Add at least one party')
      .max(20, 'Maximum 20 parties'),
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

const emptyParty = { name: '', email: '', role: '' }

const PartiesFields = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'parties',
  })

  const partiesError =
    (typeof errors.parties?.message === 'string' && errors.parties.message) ||
    (typeof errors.parties?.root?.message === 'string' && errors.parties.root.message)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <Label className="text-base">Parties</Label>
          <p className="text-sm text-muted-foreground">At least one party is required.</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={fields.length >= 20}
          onClick={() => append({ ...emptyParty })}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add party
        </Button>
      </div>
      {partiesError ? <p className="text-xs text-destructive">{partiesError}</p> : null}
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="relative rounded-lg border border-border bg-muted/30 p-4 pt-3"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Party {index + 1}
              </span>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-destructive hover:text-destructive"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove party</span>
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                name={`parties.${index}.name`}
                label="Name"
                placeholder="Acme Corp"
                required
                className="sm:col-span-2"
              />
              <FormField
                name={`parties.${index}.email`}
                label="Email"
                type="email"
                placeholder="legal@example.com"
              />
              <FormField
                name={`parties.${index}.role`}
                label="Role"
                placeholder="Buyer, Seller…"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const buildDefaultValues = (fromParent) => {
  const base = {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'DRAFT',
    parties: [{ ...emptyParty }],
  }
  if (!fromParent) return base
  return {
    ...base,
    ...fromParent,
    parties:
      Array.isArray(fromParent.parties) && fromParent.parties.length > 0
        ? fromParent.parties.map((p) => ({
            name: p.name ?? '',
            email: p.email ?? '',
            role: p.role ?? '',
          }))
        : [{ ...emptyParty }],
  }
}

const ContractForm = ({ defaultValues, onSubmit, isLoading, isEdit = false, isAdmin = false }) => {
  const methods = useForm({
    resolver: zodResolver(contractSchema),
    defaultValues: buildDefaultValues(defaultValues),
  })

  const createStatusOptions = isAdmin
    ? STATUS_OPTIONS
    : STATUS_OPTIONS.filter((s) => s.value === 'DRAFT' || s.value === 'ACTIVE')

  const statusOptions = isEdit ? STATUS_OPTIONS : createStatusOptions

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
        <PartiesFields />
        <FormSelect name="status" label="Status" options={statusOptions} required />
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
