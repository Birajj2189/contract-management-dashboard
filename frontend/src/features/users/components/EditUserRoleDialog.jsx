import { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useUpdateUser } from '@/features/users/hooks/useUserMutations'
import toast from 'react-hot-toast'
import { useState } from 'react'

const EditUserRoleDialog = ({ user, open, onOpenChange }) => {
  const { mutateAsync, isPending } = useUpdateUser()
  const [role, setRole] = useState('USER')

  useEffect(() => {
    if (user && open) setRole(user.role)
  }, [user, open])

  if (!user) return null

  const handleSave = async () => {
    if (role === user.role) {
      onOpenChange(false)
      return
    }
    try {
      await mutateAsync({ userId: user.id, body: { role } })
      toast.success('Role updated.')
      onOpenChange(false)
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not update role.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit role</DialogTitle>
          <DialogDescription>
            Change role for <span className="font-medium text-foreground">{user.name}</span> (
            {user.email}).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label>Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditUserRoleDialog
