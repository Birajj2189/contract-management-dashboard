import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter } from 'lucide-react'
import PageWrapper from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
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

const ContractsPage = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const debouncedSearch = useDebounce(search, env.debounceDelay)

  const params = {
    page,
    limit: env.pageSize,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(statusFilter && { status: statusFilter }),
  }

  const { data, isLoading } = useContracts(params)
  const { mutate: deleteContract, isPending: isDeleting } = useDeleteContract()

  const contracts = data?.contracts || []
  const totalPages = data?.pagination?.totalPages || 1

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
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
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
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val === 'ALL' ? '' : val)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-36">
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
      </div>

      <ContractTable
        data={contracts}
        isLoading={isLoading}
        pagination={{ page, totalPages, onPageChange: setPage }}
        onDelete={setDeleteTarget}
      />

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
