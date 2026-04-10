import { useContracts } from '@/features/contracts/hooks/useContractQueries'
import PageWrapper from '@/components/layout/PageWrapper'
import StatsCard from '@/features/dashboard/components/StatsCard'
import ContractStatusChart from '@/features/dashboard/components/ContractStatusChart'
import RecentActivity from '@/features/dashboard/components/RecentActivity'
import { useAuth } from '@/hooks/useAuth'
import { FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import env from '@/config/env'

const DashboardPage = () => {
  const { user } = useAuth()
  const { data } = useContracts({ limit: env.maxListLimit })

  const contracts = data?.contracts || []

  // Compute stats from loaded contracts
  const total = contracts.length
  const active = contracts.filter((c) => c.status === 'ACTIVE').length
  const draft = contracts.filter((c) => c.status === 'DRAFT').length
  const expired = contracts.filter((c) => c.status === 'EXPIRED').length

  const statusMap = contracts.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1
    return acc
  }, {})

  const recent = [...contracts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6)

  return (
    <PageWrapper
      title={`Good ${getTimeOfDay()}, ${user?.name?.split(' ')[0] || 'there'}`}
      description="Here's an overview of your contracts"
    >
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total contracts" value={total} icon={FileText} />
        <StatsCard title="Active" value={active} icon={CheckCircle} description="Currently active" />
        <StatsCard title="Draft" value={draft} icon={Clock} description="Pending activation" />
        <StatsCard
          title="Expired"
          value={expired}
          icon={AlertTriangle}
          description="Requires attention"
        />
      </div>

      {/* Chart + Recent */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <ContractStatusChart data={statusMap} />
        </div>
        <div className="lg:col-span-3">
          <RecentActivity contracts={recent} />
        </div>
      </div>
    </PageWrapper>
  )
}

const getTimeOfDay = () => {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

export default DashboardPage
