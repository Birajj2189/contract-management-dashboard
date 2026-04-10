import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { STATUS_LABELS, STATUS_CHART_HEX } from '@/utils/statusColors'

function ChartTooltip({ active, payload, total }) {
  if (!active || !payload?.length) return null
  const row = payload[0]
  const value = row.value
  const name = row.name
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
  return (
    <div className="rounded-lg border border-border/80 bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-foreground">{name}</p>
      <p className="mt-0.5 tabular-nums text-muted-foreground">
        <span className="font-medium text-foreground">{value}</span> contracts ·{' '}
        <span className="font-medium text-foreground">{pct}%</span>
      </p>
    </div>
  )
}

function statusInsight(chartRows) {
  if (!chartRows.length) return null
  const sorted = [...chartRows].sort((a, b) => b.value - a.value)
  const top = sorted[0]
  if (!top?.value) return null
  const label = STATUS_LABELS[top.status] || top.name
  return `Most contracts are ${label} (${top.value} total).`
}

const ContractsChart = ({ data = {}, isLoading = false, className }) => {
  const chartData = useMemo(
    () =>
      Object.entries(data)
        .filter(([, count]) => count > 0)
        .map(([status, count]) => ({
          name: STATUS_LABELS[status] || status.charAt(0) + status.slice(1).toLowerCase(),
          value: count,
          status,
        })),
    [data]
  )

  const total = useMemo(() => chartData.reduce((s, d) => s + d.value, 0), [chartData])
  const insight = useMemo(() => statusInsight(chartData), [chartData])

  return (
    <Card className={className ?? 'min-w-0 overflow-hidden shadow-sm'}>
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="text-base">Contracts by status</CardTitle>
        {insight && !isLoading && (
          <CardDescription className="text-xs leading-relaxed">{insight}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="min-w-0">
        {isLoading ? (
          <div
            className="flex h-[220px] w-full min-w-0 items-center justify-center"
            role="status"
            aria-label="Loading chart"
          >
            <Skeleton className="h-[180px] w-[180px] max-w-full rounded-full" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[220px] w-full min-w-0 items-center justify-center text-sm text-muted-foreground">
            No data available
          </div>
        ) : (
          <div className="h-[240px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 4, bottom: 8, left: 4 }}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="45%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  strokeWidth={0}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_CHART_HEX[entry.status] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip content={(props) => <ChartTooltip {...props} total={total} />} />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  layout="horizontal"
                  wrapperStyle={{ paddingTop: 12, fontSize: 12 }}
                  formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ContractsChart
