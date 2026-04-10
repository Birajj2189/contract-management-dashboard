import { useState, useMemo, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useContracts } from '@/features/contracts/hooks/useContractQueries'
import PageWrapper from '@/components/layout/PageWrapper'
import ExportButton from '@/features/reports/components/ExportButton'
import StatsCard from '@/features/dashboard/components/StatsCard'
import ContractStatusChart from '@/features/dashboard/components/ContractStatusChart'
import ReportsContractsPanel from '@/features/reports/components/ReportsContractsPanel'
import ReportsPageSkeleton from '@/features/reports/components/ReportsPageSkeleton'
import { Button } from '@/components/ui/Button'
import { FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import env from '@/config/env'

const ReportsPage = () => {
  const reduceMotion = useReducedMotion()
  const [filters, setFilters] = useState({ status: '', year: '' })
  const [page, setPage] = useState(1)

  const { data, isPending, isError, error, refetch } = useContracts({ limit: env.maxListLimit })
  const all = data?.contracts || []

  const filtered = useMemo(() => {
    return all.filter((c) => {
      if (filters.status && c.status !== filters.status) return false
      if (filters.year) {
        const year = new Date(c.createdAt).getFullYear().toString()
        if (year !== filters.year) return false
      }
      return true
    })
  }, [all, filters.status, filters.year])

  const statusMap = useMemo(() => {
    return filtered.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1
      return acc
    }, {})
  }, [filtered])

  const pageSize = env.pageSize
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize) || 1)

  useEffect(() => {
    setPage(1)
  }, [filters.status, filters.year])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const pagination =
    filtered.length > 0
      ? {
          page,
          totalPages,
          total: filtered.length,
          pageSize,
          onPageChange: setPage,
        }
      : undefined

  return (
    <PageWrapper
      className="min-w-0"
      title="Reports"
      description="Analytics and export for your contracts"
      actions={<ExportButton data={filtered} disabled={isPending && data == null} />}
    >
      {isError && (
        <div
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          <span className="font-medium">Could not load reports data.</span>{' '}
          {error?.response?.data?.message || error?.message || 'Please try again.'}
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

      {isPending && data == null && !isError && <ReportsPageSkeleton />}

      {data != null && (
        <motion.div
          className="min-w-0 space-y-6"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
        >
          <section aria-label="Summary statistics">
            <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatsCard title="Total" value={filtered.length} icon={FileText} />
              <StatsCard title="Active" value={statusMap.ACTIVE || 0} icon={CheckCircle} />
              <StatsCard title="Draft" value={statusMap.DRAFT || 0} icon={Clock} />
              <StatsCard title="Expired" value={statusMap.EXPIRED || 0} icon={AlertTriangle} />
            </div>
          </section>

          <section
            aria-label="Charts and contract data"
            className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-12"
          >
            <div className="min-w-0 xl:col-span-4">
              <ContractStatusChart data={statusMap} />
            </div>
            <div className="min-w-0 xl:col-span-8">
              <ReportsContractsPanel
                filters={filters}
                onFiltersChange={setFilters}
                tableData={paginatedRows}
                isLoading={false}
                pagination={pagination}
              />
            </div>
          </section>
        </motion.div>
      )}
    </PageWrapper>
  )
}

export default ReportsPage
