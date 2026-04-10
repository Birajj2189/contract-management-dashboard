import { format, parseISO, isValid, formatDistanceToNow } from 'date-fns'

export const formatDate = (date, pattern = 'MMM d, yyyy') => {
  if (!date) return '—'
  try {
    const parsed = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(parsed)) return '—'
    return format(parsed, pattern)
  } catch {
    return '—'
  }
}

export const formatDateTime = (date) => formatDate(date, 'MMM d, yyyy h:mm a')

export const formatRelative = (date) => {
  if (!date) return '—'
  try {
    const parsed = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(parsed)) return '—'
    return formatDistanceToNow(parsed, { addSuffix: true })
  } catch {
    return '—'
  }
}
