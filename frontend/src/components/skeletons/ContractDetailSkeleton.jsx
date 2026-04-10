import PageWrapper from '@/components/layout/PageWrapper'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

const ContractDetailSkeleton = () => (
  <PageWrapper
    title={
      <span className="block">
        <span className="sr-only">Loading contract</span>
        <Skeleton className="h-7 w-full max-w-md" aria-hidden />
      </span>
    }
    description={<Skeleton className="mt-1 h-4 w-56" aria-hidden />}
    actions={
      <div className="flex gap-2" aria-hidden>
        <Skeleton className="h-9 w-[4.5rem] rounded-md" />
        <Skeleton className="h-9 w-[4.5rem] rounded-md" />
      </div>
    }
  >
    <div
      className="grid gap-4 lg:grid-cols-3"
      role="status"
      aria-label="Loading contract details"
    >
      <div className="space-y-4 lg:col-span-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-28" />
          </CardHeader>
          <CardContent className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-28" />
          </CardHeader>
          <CardContent className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  </PageWrapper>
)

export default ContractDetailSkeleton
