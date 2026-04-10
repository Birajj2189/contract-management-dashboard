import { cn } from '@/utils/cn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

const StatsCard = ({ title, value, description, icon: Icon, trend, className }) => (
  <Card
    className={cn(
      'hover:border-border hover:shadow-md motion-safe:transition-[box-shadow,border-color]',
      className
    )}
  >
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      {Icon && (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-inner">
          <Icon className="h-4 w-4" />
        </div>
      )}
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold tabular-nums tracking-tight">{value ?? '—'}</p>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
      {trend !== undefined && (
        <p className={cn('mt-1 text-xs', trend >= 0 ? 'text-green-600' : 'text-destructive')}>
          {trend >= 0 ? '+' : ''}{trend}% from last month
        </p>
      )}
    </CardContent>
  </Card>
)

export default StatsCard
