import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

const STATUS_COLORS = {
  DRAFT: '#94a3b8',
  ACTIVE: '#22c55e',
  EXECUTED: '#3b82f6',
  EXPIRED: '#ef4444',
}

const ContractStatusChart = ({ data = {}, isLoading = false }) => {
  const chartData = Object.entries(data).map(([status, count]) => ({
    name: status.charAt(0) + status.slice(1).toLowerCase(),
    value: count,
    status,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Contracts by status</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div
            className="flex h-[200px] items-center justify-center"
            role="status"
            aria-label="Loading chart"
          >
            <Skeleton className="h-[180px] w-[180px] rounded-full" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [value, name]}
                contentStyle={{ fontSize: '12px' }}
              />
              <Legend
                formatter={(value) => (
                  <span className="text-xs">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

export default ContractStatusChart
