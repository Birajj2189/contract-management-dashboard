import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import PageWrapper from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import ContractTable from '@/features/contracts/components/ContractTable'
import ContractsFilterToolbar from '@/features/contracts/components/ContractsFilterToolbar'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useContracts, useDeleteContract } from '@/features/contracts/hooks/useContractQueries'
import { useDebounce } from '@/hooks/useDebounce'
import env from '@/config/env'
import { motion, useReducedMotion } from 'framer-motion'

/** Matches API `sortBy` + `sortOrder` (listContractsQuerySchema). */
const SORT_PRESETS = [
  { value: 'createdAt-desc', sortBy: 'createdAt', sortOrder: 'desc', label: 'Created · newest first' },
  { value: 'createdAt-asc', sortBy: 'createdAt', sortOrder: 'asc', label: 'Created · oldest first' },
  { value: 'updatedAt-desc', sortBy: 'updatedAt', sortOrder: 'desc', label: 'Updated · newest first' },
  { value: 'updatedAt-asc', sortBy: 'updatedAt', sortOrder: 'asc', label: 'Updated · oldest first' },
]

const ContractsPage = () => {
  const reduceMotion = useReducedMotion()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortPreset, setSortPreset] = useState('createdAt-desc')
  const [startDateFrom, setStartDateFrom] = useState('')
  const [startDateTo, setStartDateTo] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

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

  const { data, isLoading } = useContracts(params)
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
      title="Contracts"
      description="Manage all your contracts in one place"
      actions={
        <Button asChild size="sm">
          <Link to="/contracts/new">
            <Plus className="mr-1 h-4 w-4" />
            New contract
          </Link>
        </Button>
      }
    >
      <ContractsFilterToolbar
        search={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        statusFilter={statusFilter}
        onStatusChange={(v) => {
          setStatusFilter(v)
          setPage(1)
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

      <motion.div
        key={isLoading ? 'contracts-loading' : 'contracts-ready'}
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.22 }}
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
