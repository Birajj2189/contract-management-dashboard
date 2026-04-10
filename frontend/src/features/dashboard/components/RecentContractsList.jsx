import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import StatusBadge from '@/features/contracts/components/StatusBadge'
import { formatRelative } from '@/utils/formatDate'
import { Clock, FileText } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { Separator } from '@/components/ui/Separator'
import EmptyState from '@/components/common/EmptyState'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

const RecentContractsList = ({ contracts = [], isLoading = false }) => {
  return (
    <Card className="min-w-0 overflow-hidden shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Clock className="h-4 w-4 text-muted-foreground" aria-hidden />
          Recent contracts
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-2 pt-0">
        {isLoading ? (
          <div className="space-y-0 px-6" role="status" aria-label="Loading recent contracts">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                {i > 0 && <Separator className="my-3 bg-border/60" />}
                <div className="flex items-center justify-between gap-3 py-1">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-full max-w-[min(280px,70vw)]" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-6 w-[4.5rem] shrink-0 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : contracts.length === 0 ? (
          <div className="px-6 pb-4">
            <EmptyState
              icon={FileText}
              title="No contracts yet"
              description="Create your first contract to see it here."
              action={
                <Link
                  to="/contracts/new"
                  className={cn(buttonVariants({ variant: 'default', size: 'sm' }))}
                >
                  Create contract
                </Link>
              }
              className="border-dashed bg-muted/10 py-10"
            />
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {contracts.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/contracts/${c.id}`}
                  className="flex items-center justify-between gap-3 px-6 py-3.5 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{c.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatRelative(c.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={c.status} className="ml-2 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentContractsList
