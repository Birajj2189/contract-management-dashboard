import PageWrapper from '@/components/layout/PageWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

const ContractFormSkeleton = () => (
  <PageWrapper
    backFallback="/contracts"
    title="Edit contract"
    description="Update the record below. Changes are saved as a new version when you submit."
  >
    <div className="mx-auto w-full max-w-3xl" role="status" aria-label="Loading form">
      <Card className="overflow-hidden border-border/70 shadow-md ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
        <CardHeader className="space-y-1 border-b border-border/60 bg-muted/25 px-5 py-5 sm:px-8 sm:py-6">
          <CardTitle className="text-base font-semibold sm:text-lg">Contract details</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            <Skeleton className="h-4 w-full max-w-md" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 px-5 py-6 sm:px-8 sm:py-8">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-28" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border/80 bg-muted/20 p-5 sm:p-6">
            <div className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:justify-between">
              <Skeleton className="h-12 w-full max-w-sm" />
              <Skeleton className="h-9 w-28 shrink-0" />
            </div>
            <div className="mt-5 rounded-xl border border-border/70 bg-card p-4 sm:p-5">
              <Skeleton className="mb-4 h-4 w-24" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-md space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-6 sm:flex-row sm:justify-end">
            <Skeleton className="h-11 w-full sm:w-24" />
            <Skeleton className="h-11 w-full sm:min-w-[11.5rem] sm:w-44" />
          </div>
        </CardContent>
      </Card>
    </div>
  </PageWrapper>
)

export default ContractFormSkeleton
