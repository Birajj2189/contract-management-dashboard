import { cn } from '@/utils/cn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

const StatsCard = ({ title, value, description, icon: Icon, trend, className }) => (
  <Card className={cn('', className)}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      {Icon && (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      )}
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold">{value ?? '—'}</p>
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
