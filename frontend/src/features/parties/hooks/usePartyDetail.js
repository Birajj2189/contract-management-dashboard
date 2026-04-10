import { useMemo } from 'react'
import { usePartiesList } from '@/features/parties/hooks/usePartiesList'

/**
 * Resolves a single party by id from the shared contracts query (no dedicated party API).
 */
export function usePartyDetail(partyId) {
  const { parties, isLoading, isError, error, refetch, isFetching } = usePartiesList()

  const party = useMemo(() => {
    if (!partyId || !parties.length) return null
    return parties.find((p) => p.id === partyId) ?? null
  }, [parties, partyId])

  return {
    party,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    isNotFound: !isLoading && !isFetching && !!partyId && !party,
  }
}
