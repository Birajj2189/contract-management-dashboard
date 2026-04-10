export const ROLE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All roles' },
  { value: 'Buyer', label: 'Buyer' },
  { value: 'Seller', label: 'Seller' },
  { value: 'Consultant', label: 'Consultant' },
  { value: 'Witness', label: 'Witness' },
  { value: 'Other', label: 'Other' },
]

/**
 * Map free-text role to a bucket for filtering and styling.
 */
export function normalizePartyRole(role) {
  if (!role || typeof role !== 'string' || !role.trim()) return 'Other'
  const lower = role.toLowerCase()
  if (lower.includes('buy')) return 'Buyer'
  if (lower.includes('sell')) return 'Seller'
  if (lower.includes('consult')) return 'Consultant'
  if (lower.includes('witness')) return 'Witness'
  return 'Other'
}

const ROLE_BADGE_STYLES = {
  Buyer:
    'border-blue-400/80 bg-blue-100 text-blue-950 shadow-sm dark:border-blue-500 dark:bg-blue-950 dark:text-blue-50',
  Seller:
    'border-emerald-400/80 bg-emerald-100 text-emerald-950 shadow-sm dark:border-emerald-500 dark:bg-emerald-950 dark:text-emerald-50',
  Consultant:
    'border-violet-400/80 bg-violet-100 text-violet-950 shadow-sm dark:border-violet-500 dark:bg-violet-950 dark:text-violet-50',
  Witness:
    'border-slate-400/70 bg-slate-200 text-slate-900 shadow-sm dark:border-slate-500 dark:bg-slate-700 dark:text-slate-50',
  Other: 'border-border bg-muted text-foreground/90 shadow-sm dark:bg-muted/80',
}

export function roleBadgeClassForBucket(bucket) {
  return ROLE_BADGE_STYLES[bucket] || ROLE_BADGE_STYLES.Other
}
