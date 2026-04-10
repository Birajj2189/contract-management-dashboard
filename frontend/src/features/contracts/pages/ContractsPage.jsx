import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, ArrowDownUp, CalendarRange } from 'lucide-react'
import PageWrapper from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import ContractTable from '@/features/contracts/components/ContractTable'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useContracts, useDeleteContract } from '@/features/contracts/hooks/useContractQueries'
import { useDebounce } from '@/hooks/useDebounce'
import { STATUS_OPTIONS } from '@/utils/statusColors'
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
  const totalPages = data?.meta?.totalPages || 1

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
      {/* Filters + sort */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contracts..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <Select
              value={statusFilter || 'ALL'}
              onValueChange={(val) => {
                setStatusFilter(val === 'ALL' ? '' : val)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-[9.5rem]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <ArrowDownUp className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <Select
              value={sortPreset}
              onValueChange={(val) => {
                setSortPreset(val)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-[13.5rem] sm:w-[15rem]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_PRESETS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Contract start date range (API: startDateFrom / startDateTo on contract.startDate) */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
        <div className="flex items-center gap-2 text-muted-foreground sm:pb-2">
          <CalendarRange className="h-4 w-4 shrink-0" aria-hidden />
          <span className="text-sm font-medium text-foreground">Start date</span>
        </div>
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
          <div className="space-y-1.5 sm:min-w-[10.5rem]">
            <Label htmlFor="contracts-start-from" className="text-xs text-muted-foreground">
              From
            </Label>
            <Input
              id="contracts-start-from"
              type="date"
              value={startDateFrom}
              max={startDateTo || undefined}
              className="w-full"
              onChange={(e) => {
                setStartDateFrom(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <div className="space-y-1.5 sm:min-w-[10.5rem]">
            <Label htmlFor="contracts-start-to" className="text-xs text-muted-foreground">
              To
            </Label>
            <Input
              id="contracts-start-to"
              type="date"
              value={startDateTo}
              min={startDateFrom || undefined}
              className="w-full"
              onChange={(e) => {
                setStartDateTo(e.target.value)
                setPage(1)
              }}
            />
          </div>
          {(startDateFrom || startDateTo) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full shrink-0 sm:mb-0.5 sm:w-auto"
              onClick={() => {
                setStartDateFrom('')
                setStartDateTo('')
                setPage(1)
              }}
            >
              Clear dates
            </Button>
          )}
        </div>
      </div>

      <motion.div
        key={isLoading ? 'contracts-loading' : 'contracts-ready'}
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.22 }}
      >
        <ContractTable
          data={contracts}
          isLoading={isLoading}
          pagination={{ page, totalPages, onPageChange: setPage }}
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
