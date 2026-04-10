import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

const StatsCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendWeekCount,
  to,
  className,
}) => {
  const trendWeekLabel =
    trendWeekCount !== undefined
      ? trendWeekCount > 0
        ? `+${trendWeekCount} this week`
        : 'None new this week'
      : null

  const inner = (
    <>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-1.5 pt-5">
        <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-inner">
            <Icon className="h-4 w-4" aria-hidden />
          </div>
        )}
      </CardHeader>
      <CardContent className="pb-5 pt-0">
        <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
          {value ?? '—'}
        </p>
        {description && (
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
        )}
        {trendWeekLabel && (
          <p className="mt-2 text-xs font-medium tabular-nums text-primary">{trendWeekLabel}</p>
        )}
        {trend !== undefined && (
          <p className={cn('mt-1 text-xs', trend >= 0 ? 'text-green-600' : 'text-destructive')}>
            {trend >= 0 ? '+' : ''}
            {trend}% from last month
          </p>
        )}
      </CardContent>
    </>
  )

  const cardClass = cn(
    'h-full border-border/70 bg-card transition-[box-shadow,transform,border-color] duration-200',
    to &&
      'cursor-pointer hover:scale-[1.02] hover:border-primary/25 hover:shadow-md motion-reduce:transform-none',
    !to && 'hover:border-border hover:shadow-sm',
    className
  )

  if (to) {
    return (
      <Link
        to={to}
        className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Card className={cardClass}>{inner}</Card>
      </Link>
    )
  }

  return <Card className={cardClass}>{inner}</Card>
}

export default StatsCard
