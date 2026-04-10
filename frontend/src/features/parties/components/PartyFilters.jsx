import { Briefcase, FileText } from 'lucide-react'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { ROLE_FILTER_OPTIONS } from '@/features/parties/utils/partyRoles'
import { cn } from '@/utils/cn'

const PartyFilters = ({
  roleFilter,
  onRoleChange,
  contractFilter,
  onContractChange,
  contractOptions,
  className,
}) => (
  <div className={cn('flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end', className)}>
    <div className="min-w-[10rem] flex-1 space-y-2 sm:max-w-[12rem]">
      <Label className="text-xs font-medium text-muted-foreground">Role</Label>
      <div className="flex items-center gap-2">
        <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground/80" aria-hidden />
        <Select value={roleFilter} onValueChange={onRoleChange}>
          <SelectTrigger className="h-10 w-full rounded-xl border-border/80 bg-background/80 shadow-sm">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    <div className="min-w-0 flex-1 space-y-2 sm:min-w-[14rem] sm:max-w-md">
      <Label className="text-xs font-medium text-muted-foreground">Contract</Label>
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 shrink-0 text-muted-foreground/80" aria-hidden />
        <Select
          value={contractFilter || 'ALL'}
          onValueChange={(v) => onContractChange(v === 'ALL' ? '' : v)}
        >
          <SelectTrigger className="h-10 w-full rounded-xl border-border/80 bg-background/80 shadow-sm">
            <SelectValue placeholder="All contracts" />
          </SelectTrigger>
          <SelectContent className="max-h-[min(320px,70vh)]">
            <SelectItem value="ALL">All contracts</SelectItem>
            {contractOptions.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                <span className="line-clamp-2 text-left">{c.title}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
)

export default PartyFilters
