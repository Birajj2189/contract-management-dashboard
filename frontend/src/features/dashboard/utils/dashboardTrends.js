import { subDays } from 'date-fns'

/**
 * Count contracts created on or after `since` (inclusive).
 */
export function countCreatedSince(contracts, since, predicate = () => true) {
  const t = since.getTime()
  return contracts.filter((c) => {
    if (!c?.createdAt) return false
    if (new Date(c.createdAt).getTime() < t) return false
    return predicate(c)
  }).length
}

/** Rolling 7-day window from now. */
export function getRollingWeekStart() {
  return subDays(new Date(), 7)
}

export function buildStatWeekTrends(contracts) {
  const since = getRollingWeekStart()
  return {
    total: countCreatedSince(contracts, since),
    active: countCreatedSince(contracts, since, (c) => c.status === 'ACTIVE'),
    draft: countCreatedSince(contracts, since, (c) => c.status === 'DRAFT'),
    expired: countCreatedSince(contracts, since, (c) => c.status === 'EXPIRED'),
  }
}
