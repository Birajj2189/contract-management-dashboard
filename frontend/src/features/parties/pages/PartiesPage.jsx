import { useState, useMemo, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import PageWrapper from '@/components/layout/PageWrapper'
import PagePrimaryAction from '@/components/layout/PagePrimaryAction'
import { Button } from '@/components/ui/Button'
import PartySearch from '@/features/parties/components/PartySearch'
import PartyFilters from '@/features/parties/components/PartyFilters'
import PartyTable from '@/features/parties/components/PartyTable'
import PartyPagination from '@/features/parties/components/PartyPagination'
import PartySkeleton from '@/features/parties/components/PartySkeleton'
import PartyStats from '@/features/parties/components/PartyStats'
import { usePartiesList } from '@/features/parties/hooks/usePartiesList'
import { useDebounce } from '@/hooks/useDebounce'
import { normalizePartyRole } from '@/features/parties/utils/partyRoles'
import env from '@/config/env'

const PartiesPage = () => {
  const reduceMotion = useReducedMotion()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [contractFilter, setContractFilter] = useState('')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounce(search, env.debounceDelay)
  const pageSize = env.pageSize

  const { parties, contractOptions, isLoading, isFetching, isError, error, refetch } =
    usePartiesList()

  const stats = useMemo(() => {
    let buyers = 0
    let sellers = 0
    let consultants = 0
    let witnesses = 0
    for (const p of parties) {
      const b = normalizePartyRole(p.role)
      if (b === 'Buyer') buyers += 1
      else if (b === 'Seller') sellers += 1
      else if (b === 'Consultant') consultants += 1
      else if (b === 'Witness') witnesses += 1
    }
    return { total: parties.length, buyers, sellers, consultants, witnesses }
  }, [parties])

  const filteredParties = useMemo(() => {
    let list = parties
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.email && p.email.toLowerCase().includes(q))
      )
    }
    if (roleFilter !== 'ALL') {
      list = list.filter((p) => normalizePartyRole(p.role) === roleFilter)
    }
    if (contractFilter) {
      list = list.filter((p) => p.contractId === contractFilter)
    }
    return list
  }, [parties, debouncedSearch, roleFilter, contractFilter])

  const totalPages = Math.max(1, Math.ceil(filteredParties.length / pageSize) || 1)

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredParties.slice(start, start + pageSize)
  }, [filteredParties, page, pageSize])

  const resetFilters = useCallback(() => {
    setSearch('')
    setRoleFilter('ALL')
    setContractFilter('')
    setPage(1)
  }, [])

  const handleRowClick = useCallback(
    (party) => {
      navigate(`/parties/${party.id}`)
    },
    [navigate]
  )

  const showSkeleton = isLoading && parties.length === 0
  let emptyVariant = null
  if (!showSkeleton && !isError) {
    if (parties.length === 0) emptyVariant = 'no-data'
    else if (filteredParties.length === 0) emptyVariant = 'no-match'
  }

  return (
    <PageWrapper
      className="mx-auto w-full max-w-7xl"
      title="Parties"
      description="Signatories and stakeholders across all contracts."
      actions={<PagePrimaryAction to="/contracts/new">Add party</PagePrimaryAction>}
    >
      {isError && (
        <div
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          <span className="font-medium">Could not load parties.</span>{' '}
          <span className="text-destructive/90">
            {error?.response?.data?.message || error?.message || 'Check your connection and try again.'}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-3 h-8 border-destructive/40"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </div>
      )}

      {!isError && parties.length > 0 && (
        <PartyStats
          total={stats.total}
          buyers={stats.buyers}
          sellers={stats.sellers}
          consultants={stats.consultants}
          witnesses={stats.witnesses}
        />
      )}

      <motion.div
        className="space-y-4 rounded-2xl border border-border/70 bg-card/40 p-4 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05] sm:p-6"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-6">
          <PartySearch
            value={search}
            onChange={(v) => {
              setSearch(v)
              setPage(1)
            }}
          />
          <PartyFilters
            className="lg:shrink-0"
            roleFilter={roleFilter}
            onRoleChange={(v) => {
              setRoleFilter(v)
              setPage(1)
            }}
            contractFilter={contractFilter}
            onContractChange={(v) => {
              setContractFilter(v)
              setPage(1)
            }}
            contractOptions={contractOptions}
          />
        </div>

        {isFetching && !showSkeleton && (
          <p className="text-xs text-muted-foreground" aria-live="polite">
            Updating
          </p>
        )}

        <motion.div
          key={showSkeleton ? 'skeleton' : emptyVariant || 'table'}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
        >
          {showSkeleton ? (
            <PartySkeleton />
          ) : (
            <div className="space-y-4">
              <PartyTable
                rows={pageData}
                onRowClick={handleRowClick}
                emptyVariant={emptyVariant}
                onClearFilters={emptyVariant === 'no-match' ? resetFilters : undefined}
              />
              {!emptyVariant && filteredParties.length > 0 && (
                <PartyPagination
                  page={page}
                  totalPages={totalPages}
                  total={filteredParties.length}
                  pageSize={pageSize}
                  onPageChange={setPage}
                />
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </PageWrapper>
  )
}

export default PartiesPage
