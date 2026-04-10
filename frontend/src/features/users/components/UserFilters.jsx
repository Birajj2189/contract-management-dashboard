import { Shield, UserCircle } from 'lucide-react'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { USER_ROLE_FILTER, USER_STATUS_FILTER } from '@/features/users/constants/userFilters'
import { cn } from '@/utils/cn'

const UserFilters = ({
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange,
  totalForStatusLabel,
  className,
}) => (
  <div className={cn('flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end', className)}>
    <div className="min-w-[10rem] flex-1 space-y-2 sm:max-w-[12rem]">
      <Label className="text-xs font-medium text-muted-foreground">Role</Label>
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 shrink-0 text-muted-foreground/80" aria-hidden />
        <Select value={roleFilter} onValueChange={onRoleChange}>
          <SelectTrigger className="h-10 w-full rounded-xl border-border/80 bg-background/80 shadow-sm">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            {USER_ROLE_FILTER.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    <div className="min-w-[10rem] flex-1 space-y-2 sm:max-w-[14rem]">
      <Label className="text-xs font-medium text-muted-foreground">Status</Label>
      <div className="flex items-center gap-2">
        <UserCircle className="h-4 w-4 shrink-0 text-muted-foreground/80" aria-hidden />
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="h-10 w-full rounded-xl border-border/80 bg-background/80 shadow-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {USER_STATUS_FILTER.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
                {opt.value === 'all' && typeof totalForStatusLabel === 'number'
                  ? ` (${totalForStatusLabel})`
                  : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
)

export default UserFilters
