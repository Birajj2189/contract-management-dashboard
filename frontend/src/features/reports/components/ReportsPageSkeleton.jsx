import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { StatsGridSkeleton } from '@/components/skeletons/StatsCardSkeleton'

const ReportsPageSkeleton = () => (
  <div className="space-y-6">
    <StatsGridSkeleton />
    <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-12">
      <div className="min-w-0 xl:col-span-4">
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <div className="flex h-[220px] w-full items-center justify-center">
              <Skeleton className="h-[180px] w-[180px] rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="min-w-0 xl:col-span-8">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col gap-4 border-b border-border/60 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-6 w-48" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-10 w-28" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-4 px-4 py-3">
                  <Skeleton className="h-4 flex-1 max-w-md" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
)

export default ReportsPageSkeleton
