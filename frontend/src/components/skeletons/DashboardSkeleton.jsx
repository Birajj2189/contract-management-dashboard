import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { StatsGridSkeleton } from './StatsCardSkeleton'

const ChartSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-5 w-40" />
    </CardHeader>
    <CardContent>
      <Skeleton className="mx-auto h-[200px] w-[200px] rounded-full" />
    </CardContent>
  </Card>
)

const RecentSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-5 w-36" />
    </CardHeader>
    <CardContent className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-4 w-full max-w-[240px]" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
        </div>
      ))}
    </CardContent>
  </Card>
)

const DashboardSkeleton = () => (
  <div className="space-y-6" role="status" aria-label="Loading dashboard">
    <StatsGridSkeleton />
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <ChartSkeleton />
      </div>
      <div className="lg:col-span-3">
        <RecentSkeleton />
      </div>
    </div>
  </div>
)

export default DashboardSkeleton
