import { useContracts } from '@/features/contracts/hooks/useContractQueries'
import PageWrapper from '@/components/layout/PageWrapper'
import StatsCard from '@/features/dashboard/components/StatsCard'
import ContractStatusChart from '@/features/dashboard/components/ContractStatusChart'
import RecentActivity from '@/features/dashboard/components/RecentActivity'
import { useAuth } from '@/hooks/useAuth'
import { FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import env from '@/config/env'
import DashboardSkeleton from '@/components/skeletons/DashboardSkeleton'
import { StaggerContainer, StaggerItem } from '@/components/motion/Stagger'
import { motion, useReducedMotion } from 'framer-motion'
import { Skeleton } from '@/components/ui/Skeleton'

const DashboardPage = () => {
  const { user } = useAuth()
  const reduceMotion = useReducedMotion()
  const { data, isPending } = useContracts({ limit: env.maxListLimit })

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

  if (isPending) {
    return (
      <PageWrapper
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
      title={`Good ${getTimeOfDay()}, ${user?.name?.split(' ')[0] || 'there'}`}
      description="Here's an overview of your contracts"
    >
      <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <motion.div
            whileHover={reduceMotion ? undefined : { y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            <StatsCard title="Total contracts" value={total} icon={FileText} />
          </motion.div>
        </StaggerItem>
        <StaggerItem>
          <motion.div
            whileHover={reduceMotion ? undefined : { y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            <StatsCard title="Active" value={active} icon={CheckCircle} description="Currently active" />
          </motion.div>
        </StaggerItem>
        <StaggerItem>
          <motion.div
            whileHover={reduceMotion ? undefined : { y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            <StatsCard title="Draft" value={draft} icon={Clock} description="Pending activation" />
          </motion.div>
        </StaggerItem>
        <StaggerItem>
          <motion.div
            whileHover={reduceMotion ? undefined : { y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            <StatsCard
              title="Expired"
              value={expired}
              icon={AlertTriangle}
              description="Requires attention"
            />
          </motion.div>
        </StaggerItem>
      </StaggerContainer>

      <motion.div
        className="grid gap-4 lg:grid-cols-5"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.28, delay: reduceMotion ? 0 : 0.12 }}
      >
        <div className="lg:col-span-2">
          <ContractStatusChart data={statusMap} />
        </div>
        <div className="lg:col-span-3">
          <RecentActivity contracts={recent} />
        </div>
      </motion.div>
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
