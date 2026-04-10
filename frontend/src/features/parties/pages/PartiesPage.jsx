import { useState } from 'react'
import { useContracts } from '@/features/contracts/hooks/useContractQueries'
import PageWrapper from '@/components/layout/PageWrapper'
import PartiesTable from '@/features/parties/components/PartiesTable'
import { Input } from '@/components/ui/Input'
import { Search } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import env from '@/config/env'

const PartiesPage = () => {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, env.debounceDelay)

  // Load all contracts and flatten their parties
  const { data, isLoading } = useContracts({ limit: env.maxListLimit })

  const allParties = (data?.contracts || []).flatMap((contract) =>
    (contract.parties || []).map((party) => ({
      ...party,
      contractId: contract.id,
      contractTitle: contract.title,
    }))
  )

  const filtered = debouncedSearch
    ? allParties.filter(
        (p) =>
          p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          p.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : allParties

  return (
    <PageWrapper
      title="Parties"
      description="All parties and signatories across contracts"
    >
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <PartiesTable data={filtered} isLoading={isLoading} />
    </PageWrapper>
  )
}

export default PartiesPage
