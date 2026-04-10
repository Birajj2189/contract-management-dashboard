import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import StatusBadge from '@/features/contracts/components/StatusBadge'
import { formatRelative } from '@/utils/formatDate'
import { Clock } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'

const RecentActivity = ({ contracts = [], isLoading = false }) => {
  const navigate = useNavigate()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4" />
          Recent contracts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3" role="status" aria-label="Loading recent contracts">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-full max-w-[240px]" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
              </div>
            ))}
          </div>
        ) : contracts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity.</p>
        ) : (
          <div className="space-y-3">
            {contracts.map((c) => (
              <button
                key={c.id}
                className="flex w-full items-center justify-between rounded-lg px-1 py-1.5 text-left transition-colors hover:bg-muted/50"
                onClick={() => navigate(`/contracts/${c.id}`)}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{formatRelative(c.createdAt)}</p>
                </div>
                <StatusBadge status={c.status} className="ml-2 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentActivity
