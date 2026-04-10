import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Label } from '@/components/ui/Label'
import { STATUS_OPTIONS } from '@/utils/statusColors'

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => ({
  value: String(y),
  label: String(y),
}))

const ReportFilters = ({ filters, onChange }) => (
  <div className="flex flex-wrap items-end gap-3 sm:gap-4">
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">Status</Label>
      <Select
        value={filters.status || 'ALL'}
        onValueChange={(val) => onChange({ ...filters, status: val === 'ALL' ? '' : val })}
      >
        <SelectTrigger className="h-10 w-[10.5rem] rounded-lg sm:w-40">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">Year</Label>
      <Select
        value={filters.year || 'ALL'}
        onValueChange={(val) => onChange({ ...filters, year: val === 'ALL' ? '' : val })}
      >
        <SelectTrigger className="h-10 w-28 rounded-lg">
          <SelectValue placeholder="All years" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All years</SelectItem>
          {YEAR_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
)

export default ReportFilters
