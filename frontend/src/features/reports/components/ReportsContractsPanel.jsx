import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import ReportFilters from '@/features/reports/components/ReportFilters'
import ReportTable from '@/features/reports/components/ReportTable'

/**
 * Filters + contract table inside one card (aligned toolbar, stable flex layout).
 */
const ReportsContractsPanel = ({
  filters,
  onFiltersChange,
  tableData,
  isLoading,
  pagination,
}) => (
  <Card className="min-w-0 overflow-hidden shadow-sm">
    <CardHeader className="flex flex-col gap-4 border-b border-border/60 bg-muted/10 pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0 space-y-1">
        <CardTitle className="text-base">Contract list</CardTitle>
        <CardDescription>Filter by status and year. Export uses all matching rows.</CardDescription>
      </div>
      <div className="shrink-0">
        <ReportFilters filters={filters} onChange={onFiltersChange} />
      </div>
    </CardHeader>
    <CardContent className="p-0">
      <ReportTable
        data={tableData}
        isLoading={isLoading}
        variant="plain"
        pagination={pagination}
        emptyDescription="Try widening filters or import more contracts."
      />
    </CardContent>
  </Card>
)

export default ReportsContractsPanel
