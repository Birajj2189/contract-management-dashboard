import { FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useContracts } from '@/features/contracts/hooks/useContractQueries'
import PageWrapper from '@/components/layout/PageWrapper'
import PagePrimaryAction from '@/components/layout/PagePrimaryAction'
import StatsCard from '@/features/dashboard/components/StatsCard'
import ContractsChart from '@/features/dashboard/components/ContractsChart'
import RecentContractsList from '@/features/dashboard/components/RecentContractsList'
import DashboardLayout from '@/features/dashboard/components/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import env from '@/config/env'
import DashboardSkeleton from '@/components/skeletons/DashboardSkeleton'
import { StaggerContainer, StaggerItem } from '@/components/motion/Stagger'
import { Skeleton } from '@/components/ui/Skeleton'
import { buildStatWeekTrends } from '@/features/dashboard/utils/dashboardTrends'

const DashboardPage = () => {
  const { user } = useAuth()
  const reduceMotion = useReducedMotion()
  const { data, isPending } = useContracts({ limit: env.maxListLimit })

  const contracts = data?.contracts || []

  const total = contracts.length
  const active = contracts.filter((c) => c.status === 'ACTIVE').length
  const draft = contracts.filter((c) => c.status === 'DRAFT').length
  const expired = contracts.filter((c) => c.status === 'EXPIRED').length

  const statusMap = contracts.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1
    return acc
  }, {})

  const weekTrends = buildStatWeekTrends(contracts)

  const recent = [...contracts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6)

  if (isPending) {
    return (
      <PageWrapper
        className="mx-auto min-w-0 w-full max-w-7xl"
        title={
          <span className="block">
            <span className="sr-only">Loading dashboard</span>
            <Skeleton className="h-7 w-64 max-w-[85vw]" aria-hidden />
          </span>
        }
        description={<Skeleton className="h-4 w-72 max-w-full" aria-hidden />}
      >
        <DashboardSkeleton />
      </PageWrapper>
    )
  }

  return (
    <PageWrapper
      className="mx-auto min-w-0 w-full max-w-7xl"
      title={`Good ${getTimeOfDay()}, ${user?.name?.split(' ')[0] || 'there'}`}
      description="Here's an overview of your contracts"
      actions={<PagePrimaryAction to="/contracts/new">Create contract</PagePrimaryAction>}
    >
      <DashboardLayout
        stats={
          <StaggerContainer className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <StaggerItem className="min-w-0">
              <StatsCard
                title="Total contracts"
                value={total}
                icon={FileText}
                description="All records in your workspace"
                trendWeekCount={weekTrends.total}
                to="/contracts"
              />
            </StaggerItem>
            <StaggerItem className="min-w-0">
              <StatsCard
                title="Active"
                value={active}
                icon={CheckCircle}
                description="Currently active"
                trendWeekCount={weekTrends.active}
                to="/contracts?status=ACTIVE"
              />
            </StaggerItem>
            <StaggerItem className="min-w-0">
              <StatsCard
                title="Draft"
                value={draft}
                icon={Clock}
                description="Pending activation"
                trendWeekCount={weekTrends.draft}
                to="/contracts?status=DRAFT"
              />
            </StaggerItem>
            <StaggerItem className="min-w-0">
              <StatsCard
                title="Expired"
                value={expired}
                icon={AlertTriangle}
                description="Requires attention"
                trendWeekCount={weekTrends.expired}
                to="/contracts?status=EXPIRED"
              />
            </StaggerItem>
          </StaggerContainer>
        }
        main={
          <>
            <div className="min-w-0 lg:col-span-2">
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.22, delay: reduceMotion ? 0 : 0.06 }}
              >
                <ContractsChart data={statusMap} />
              </motion.div>
            </div>
            <div className="min-w-0 lg:col-span-3">
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.22, delay: reduceMotion ? 0 : 0.1 }}
              >
                <RecentContractsList contracts={recent} />
              </motion.div>
            </div>
          </>
        }
      />
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
