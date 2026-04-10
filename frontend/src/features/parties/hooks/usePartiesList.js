import { useMemo } from 'react'
import { useContracts } from '@/features/contracts/hooks/useContractQueries'
import env from '@/config/env'

/**
 * Loads contracts (with parties) and exposes a flattened party list + contract options for filters.
 */
export function usePartiesList() {
  const { data, isLoading, isError, error, refetch, isFetching } = useContracts({
    limit: env.maxListLimit,
  })

  const { parties, contractOptions } = useMemo(() => {
    const contracts = data?.contracts || []
    const rows = contracts.flatMap((contract) =>
      (contract.parties || []).map((party) => ({
        ...party,
        contractId: contract.id,
        contractTitle: contract.title,
      }))
    )
    const opts = contracts
      .map((c) => ({ id: c.id, title: c.title }))
      .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }))
    return { parties: rows, contractOptions: opts }
  }, [data])

  return {
    parties,
    contractOptions,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  }
}
