import { cn } from '@/utils/cn'
import { normalizePartyRole, roleBadgeClassForBucket } from '@/features/parties/utils/partyRoles'

export function PartyRoleBadge({ role, className }) {
  const display = role?.trim() || '—'
  const bucket = normalizePartyRole(role)
  return (
    <span
      className={cn(
        'inline-flex min-h-[1.5rem] items-center rounded-full border px-3 py-1 text-xs font-bold tracking-tight',
        roleBadgeClassForBucket(bucket),
        className
      )}
    >
      {display}
    </span>
  )
}
