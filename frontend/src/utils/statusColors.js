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
    DRAFT: 'bg-slate-100 text-slate-700 border-slate-200',
    ACTIVE: 'bg-green-100 text-green-700 border-green-200',
    EXECUTED: 'bg-blue-100 text-blue-700 border-blue-200',
    EXPIRED: 'bg-red-100 text-red-700 border-red-200',
  }
  return map[status] || 'bg-gray-100 text-gray-700 border-gray-200'
}

export const STATUS_OPTIONS = Object.values(CONTRACT_STATUS).map((s) => ({
  value: s,
  label: STATUS_LABELS[s],
}))
