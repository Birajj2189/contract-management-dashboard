import { useEffect } from 'react'
import { useForm, FormProvider, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import FormField from '@/components/forms/FormField'
import FormSelect from '@/components/forms/FormSelect'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { useFormContext, Controller } from 'react-hook-form'
import { STATUS_OPTIONS } from '@/utils/statusColors'
import { cn } from '@/utils/cn'
import { Plus, Trash2 } from 'lucide-react'
import { navigateSmartBack } from '@/components/layout/PageBackButton'

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
    <div className="rounded-2xl border border-border/80 bg-muted/20 p-5 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 space-y-1">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">Parties</h3>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Signatories and stakeholders on this agreement. At least one party is required.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-9 shrink-0 self-start shadow-sm sm:mt-0.5"
          disabled={fields.length >= 20}
          onClick={() => append({ ...emptyParty })}
        >
          <Plus className="h-4 w-4" />
          Add party
        </Button>
      </div>
      {partiesError ? <p className="mt-4 text-sm text-destructive">{partiesError}</p> : null}
      <div className="mt-5 space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-xl border border-border/70 bg-card p-4 shadow-sm sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-border/50 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Party {index + 1}
              </span>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove party</span>
                </Button>
              )}
            </div>
            <div className="space-y-4">
              <FormField
                name={`parties.${index}.name`}
                label="Name"
                placeholder="Acme Corp"
                required
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                <FormField
                  name={`parties.${index}.email`}
                  label="Email"
                  type="email"
                  placeholder="legal@example.com"
                  className="min-w-0"
                />
                <FormField
                  name={`parties.${index}.role`}
                  label="Role"
                  placeholder="Buyer, Seller, Witness…"
                  className="min-w-0"
                />
              </div>
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
  const navigate = useNavigate()
  const methods = useForm({
    resolver: zodResolver(contractSchema),
    defaultValues: buildDefaultValues(defaultValues),
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const {
    formState: { isDirty, isValid },
    trigger,
  } = methods

  const submitDisabled = isLoading || !isValid || (isEdit && !isDirty)

  useEffect(() => {
    if (isEdit) void trigger()
  }, [isEdit, trigger])

  const createStatusOptions = isAdmin
    ? STATUS_OPTIONS
    : STATUS_OPTIONS.filter((s) => s.value === 'DRAFT' || s.value === 'ACTIVE')

  const statusOptions = isEdit ? STATUS_OPTIONS : createStatusOptions

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8" noValidate>
        <div className="space-y-5">
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
            className="[&_textarea]:min-h-[100px]"
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Contract term</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <FormField name="startDate" label="Start date" type="date" required className="min-w-0" />
            <FormField name="endDate" label="End date" type="date" required className="min-w-0" />
          </div>
        </div>

        <PartiesFields />

        <div className="max-w-md space-y-2">
          <FormSelect name="status" label="Status" options={statusOptions} required />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-6 sm:flex-row sm:justify-end sm:gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => navigateSmartBack(navigate, '/contracts')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={submitDisabled}
            className="w-full bg-primary font-semibold text-primary-foreground shadow-md hover:bg-primary/90 sm:w-auto sm:min-w-[11.5rem]"
          >
            {isLoading ? 'Saving...' : isEdit ? 'Update contract' : 'Create contract'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

export default ContractForm
