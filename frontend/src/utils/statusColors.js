export const CONTRACT_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  EXECUTED: 'EXECUTED',
  EXPIRED: 'EXPIRED',
}

export const STATUS_LABELS = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  EXECUTED: 'Executed',
  EXPIRED: 'Expired',
}

// Returns tailwind classes for badge styling
export const getStatusClasses = (status) => {
  const map = {
    DRAFT: 'border-slate-300 bg-slate-200 text-slate-900 shadow-sm',
    ACTIVE: 'border-emerald-400/80 bg-emerald-100 text-emerald-950 shadow-sm',
    EXECUTED: 'border-blue-400/80 bg-blue-100 text-blue-950 shadow-sm',
    EXPIRED: 'border-red-400/80 bg-red-100 text-red-950 shadow-sm',
  }
  return map[status] || 'border-border bg-muted text-foreground shadow-sm'
}

export const STATUS_OPTIONS = Object.values(CONTRACT_STATUS).map((s) => ({
  value: s,
  label: STATUS_LABELS[s],
}))

/** Hex colors for charts — aligned with StatusBadge / tailwind palette. */
export const STATUS_CHART_HEX = {
  DRAFT: '#94a3b8',
  ACTIVE: '#22c55e',
  EXECUTED: '#3b82f6',
  EXPIRED: '#ef4444',
}
