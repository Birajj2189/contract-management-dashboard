import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageWrapper from '@/components/layout/PageWrapper'
import PagePrimaryAction from '@/components/layout/PagePrimaryAction'
import ContractTable from '@/features/contracts/components/ContractTable'
import ContractsFilterToolbar from '@/features/contracts/components/ContractsFilterToolbar'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useContracts, useDeleteContract } from '@/features/contracts/hooks/useContractQueries'
import { useDebounce } from '@/hooks/useDebounce'
import env from '@/config/env'
import { motion, useReducedMotion } from 'framer-motion'
import { CONTRACT_STATUS } from '@/utils/statusColors'

const STATUS_QUERY_OK = new Set(Object.values(CONTRACT_STATUS))

/** Matches API `sortBy` + `sortOrder` (listContractsQuerySchema). */
const SORT_PRESETS = [
  { value: 'createdAt-desc', sortBy: 'createdAt', sortOrder: 'desc', label: 'Created · newest first' },
  { value: 'createdAt-asc', sortBy: 'createdAt', sortOrder: 'asc', label: 'Created · oldest first' },
  { value: 'updatedAt-desc', sortBy: 'updatedAt', sortOrder: 'desc', label: 'Updated · newest first' },
  { value: 'updatedAt-asc', sortBy: 'updatedAt', sortOrder: 'asc', label: 'Updated · oldest first' },
]

const ContractsPage = () => {
  const reduceMotion = useReducedMotion()
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(() => {
    const s = searchParams.get('status')
    return s && STATUS_QUERY_OK.has(s) ? s : ''
  })
  const [sortPreset, setSortPreset] = useState('createdAt-desc')
  const [startDateFrom, setStartDateFrom] = useState('')
  const [startDateTo, setStartDateTo] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    const s = searchParams.get('status')
    if (s && STATUS_QUERY_OK.has(s)) setStatusFilter(s)
    else if (!s) setStatusFilter('')
  }, [searchParams])

  const syncStatusToUrl = useCallback(
    (nextStatus) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (nextStatus) next.set('status', nextStatus)
          else next.delete('status')
          return next
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  const debouncedSearch = useDebounce(search, env.debounceDelay)

  const { sortBy, sortOrder } =
    SORT_PRESETS.find((p) => p.value === sortPreset) ?? SORT_PRESETS[0]

  const params = {
    page,
    limit: env.pageSize,
    sortBy,
    sortOrder,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(statusFilter && { status: statusFilter }),
    ...(startDateFrom && { startDateFrom }),
    ...(startDateTo && { startDateTo }),
  }

  const { data, isLoading, isFetching } = useContracts(params)
  const { mutate: deleteContract, isPending: isDeleting } = useDeleteContract()

  const contracts = data?.contracts || []
  const meta = data?.meta
  const totalPages = Math.max(1, meta?.totalPages ?? 1)

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteContract(deleteTarget.id, {
      onSettled: () => setDeleteTarget(null),
    })
  }

  return (
    <PageWrapper
      className="mx-auto w-full max-w-7xl"
      title="Contracts"
      description="Manage all your contracts in one place"
      actions={<PagePrimaryAction to="/contracts/new">New contract</PagePrimaryAction>}
    >
      <motion.div
        className="space-y-4 rounded-2xl border border-border/70 bg-card/40 p-4 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05] sm:p-6"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <ContractsFilterToolbar
          embedded
          search={search}
          onSearchChange={(v) => {
            setSearch(v)
            setPage(1)
          }}
          statusFilter={statusFilter}
          onStatusChange={(v) => {
            setStatusFilter(v)
            setPage(1)
            syncStatusToUrl(v)
          }}
          statusCounts={meta?.statusCounts}
          sortPreset={sortPreset}
          onSortChange={(v) => {
            setSortPreset(v)
            setPage(1)
          }}
          sortPresets={SORT_PRESETS}
          startDateFrom={startDateFrom}
          startDateTo={startDateTo}
          onDateChange={(field, v) => {
            if (field === 'from') setStartDateFrom(v)
            else setStartDateTo(v)
            setPage(1)
          }}
          onClearDates={() => {
            setStartDateFrom('')
            setStartDateTo('')
            setPage(1)
          }}
          totalFiltered={meta?.total}
          isLoading={isLoading}
        />

        {isFetching && !isLoading && (
          <p className="text-xs text-muted-foreground" aria-live="polite">
            Updating…
          </p>
        )}

        <motion.div
          key={isLoading ? 'contracts-loading' : 'contracts-ready'}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
        >
          <ContractTable
            data={contracts}
            isLoading={isLoading}
            pagination={{
              page,
              totalPages,
              total: meta?.total,
              pageSize: meta?.limit ?? env.pageSize,
              onPageChange: setPage,
            }}
            onDelete={setDeleteTarget}
          />
        </motion.div>
      </motion.div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete contract"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </PageWrapper>
  )
}

export default ContractsPage
