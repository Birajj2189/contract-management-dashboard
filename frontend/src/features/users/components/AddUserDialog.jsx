import { useEffect } from 'react'
import { useForm, FormProvider, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import FormField from '@/components/forms/FormField'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useCreateUser } from '@/features/users/hooks/useUserMutations'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Include an uppercase letter')
    .regex(/[0-9]/, 'Include a number'),
  role: z.enum(['USER', 'ADMIN']),
})

const AddUserDialog = ({ open, onOpenChange }) => {
  const { mutateAsync, isPending } = useCreateUser()
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', role: 'USER' },
  })

  useEffect(() => {
    if (!open) {
      methods.reset({ name: '', email: '', password: '', role: 'USER' })
    }
  }, [open, methods])

  const onSubmit = async (values) => {
    try {
      await mutateAsync({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        role: values.role,
      })
      onOpenChange(false)
    } catch {
      // toast handled in mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add user</DialogTitle>
          <DialogDescription>
            Create an account with a temporary password. Share credentials securely with the new user.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField name="name" label="Full name" placeholder="Jane Doe" required autoComplete="name" />
            <FormField
              name="email"
              label="Email"
              type="email"
              placeholder="jane@company.com"
              required
              autoComplete="email"
            />
            <FormField
              name="password"
              label="Temporary password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
            <div className="space-y-2">
              <Label className="text-sm">Role</Label>
              <Controller
                name="role"
                control={methods.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {methods.formState.errors.role && (
                <p className="text-sm text-destructive">{methods.formState.errors.role.message}</p>
              )}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating…' : 'Create user'}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}

export default AddUserDialog
