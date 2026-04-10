import { useState } from 'react'
import { useContracts } from '@/features/contracts/hooks/useContractQueries'
import PageWrapper from '@/components/layout/PageWrapper'
import ReportFilters from '@/features/reports/components/ReportFilters'
import ReportTable from '@/features/reports/components/ReportTable'
import ExportButton from '@/features/reports/components/ExportButton'
import StatsCard from '@/features/dashboard/components/StatsCard'
import ContractStatusChart from '@/features/dashboard/components/ContractStatusChart'
import { FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import env from '@/config/env'

const ReportsPage = () => {
  const [filters, setFilters] = useState({ status: '', year: '' })

  const { data, isLoading } = useContracts({ limit: env.maxListLimit })
  const all = data?.contracts || []

  const filtered = all.filter((c) => {
    if (filters.status && c.status !== filters.status) return false
    if (filters.year) {
      const year = new Date(c.createdAt).getFullYear().toString()
      if (year !== filters.year) return false
    }
    return true
  })

  const statusMap = filtered.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1
    return acc
  }, {})

  return (
    <PageWrapper
      title="Reports"
      description="Analytics and export for your contracts"
      actions={<ExportButton data={filtered} />}
    >
      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total" value={filtered.length} icon={FileText} />
        <StatsCard title="Active" value={statusMap.ACTIVE || 0} icon={CheckCircle} />
        <StatsCard title="Draft" value={statusMap.DRAFT || 0} icon={Clock} />
        <StatsCard title="Expired" value={statusMap.EXPIRED || 0} icon={AlertTriangle} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ContractStatusChart data={statusMap} />
        </div>
        <div className="space-y-4 lg:col-span-2">
          <ReportFilters filters={filters} onChange={setFilters} />
          <ReportTable data={filtered} isLoading={isLoading} />
        </div>
      </div>
    </PageWrapper>
  )
}

export default ReportsPage
