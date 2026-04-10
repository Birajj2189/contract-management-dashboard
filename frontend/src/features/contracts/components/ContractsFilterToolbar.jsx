import { Search, SlidersHorizontal, ArrowDownUp, CalendarRange, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { STATUS_OPTIONS, STATUS_LABELS } from '@/utils/statusColors'
import { cn } from '@/utils/cn'

/**
 * Contracts list filters: search, status (with counts), sort, date range, match summary.
 */
const ContractsFilterToolbar = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  statusCounts,
  sortPreset,
  onSortChange,
  sortPresets,
  startDateFrom,
  startDateTo,
  onDateChange,
  onClearDates,
  totalFiltered,
  isLoading,
}) => {
  const allCount =
    statusCounts != null
      ? Object.values(statusCounts).reduce((a, b) => a + (Number(b) || 0), 0)
      : undefined

  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm',
        'ring-1 ring-black/[0.03] dark:ring-white/[0.06]'
      )}
    >
      <div className="border-b border-border/60 bg-gradient-to-br from-muted/50 via-muted/25 to-transparent px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:gap-6">
          <div className="min-w-0 flex-1 space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Search</Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/80"
                aria-hidden
              />
              <Input
                placeholder="Search by title or party name…"
                className="h-10 rounded-xl border-border/80 bg-background/80 pl-10 pr-3 shadow-sm transition-shadow focus-visible:ring-2"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end xl:shrink-0">
            <div className="space-y-2 sm:min-w-[11rem]">
              <Label className="text-xs font-medium text-muted-foreground">Status</Label>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground/80" aria-hidden />
                <Select
                  value={statusFilter || 'ALL'}
                  onValueChange={(val) => onStatusChange(val === 'ALL' ? '' : val)}
                >
                  <SelectTrigger className="h-10 w-full min-w-[11rem] rounded-xl border-border/80 bg-background/80 shadow-sm">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">
                      All statuses
                      {allCount != null ? ` (${isLoading ? '…' : allCount})` : ''}
                    </SelectItem>
                    {STATUS_OPTIONS.map((opt) => {
                      const c = statusCounts?.[opt.value]
                      const countPart =
                        isLoading && statusCounts != null
                          ? ' (…)'
                          : c != null
                            ? ` (${c})`
                            : ''
                      return (
                        <SelectItem key={opt.value} value={opt.value}>
                          {STATUS_LABELS[opt.value] ?? opt.label}
                          {countPart}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 sm:min-w-[14rem] sm:flex-1 lg:min-w-[16rem]">
              <Label className="text-xs font-medium text-muted-foreground">Sort</Label>
              <div className="flex items-center gap-2">
                <ArrowDownUp className="h-4 w-4 shrink-0 text-muted-foreground/80" aria-hidden />
                <Select value={sortPreset} onValueChange={onSortChange}>
                  <SelectTrigger className="h-10 w-full rounded-xl border-border/80 bg-background/80 shadow-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortPresets.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-x-6 sm:gap-y-3 sm:px-5 sm:py-4">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
          <div className="flex items-center gap-2 text-muted-foreground sm:pb-2.5">
            <CalendarRange className="h-4 w-4 shrink-0 text-primary/70" aria-hidden />
            <span className="text-sm font-semibold text-foreground">Start date</span>
          </div>
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div className="min-w-0 flex-1 space-y-1.5 sm:max-w-[11rem]">
              <Label htmlFor="contracts-start-from" className="text-xs text-muted-foreground">
                From
              </Label>
              <Input
                id="contracts-start-from"
                type="date"
                value={startDateFrom}
                max={startDateTo || undefined}
                className="h-10 rounded-xl border-border/80 bg-background/60"
                onChange={(e) => onDateChange('from', e.target.value)}
              />
            </div>
            <div className="hidden pb-2.5 text-muted-foreground/40 sm:block" aria-hidden>
              —
            </div>
            <div className="min-w-0 flex-1 space-y-1.5 sm:max-w-[11rem]">
              <Label htmlFor="contracts-start-to" className="text-xs text-muted-foreground">
                To
              </Label>
              <Input
                id="contracts-start-to"
                type="date"
                value={startDateTo}
                min={startDateFrom || undefined}
                className="h-10 rounded-xl border-border/80 bg-background/60"
                onChange={(e) => onDateChange('to', e.target.value)}
              />
            </div>
            {(startDateFrom || startDateTo) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-10 shrink-0 gap-1 rounded-xl text-muted-foreground hover:text-foreground"
                onClick={onClearDates}
              >
                <X className="h-3.5 w-3.5" />
                Clear dates
              </Button>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end sm:pb-0.5">
          <p className="rounded-full border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground sm:text-sm">
            {isLoading && totalFiltered == null ? (
              <span className="tabular-nums">Loading…</span>
            ) : totalFiltered != null ? (
              totalFiltered === 1 ? (
                <span>
                  <span className="tabular-nums text-foreground">1</span> matching contract
                </span>
              ) : (
                <span>
                  <span className="tabular-nums text-foreground">{totalFiltered}</span> matching
                  contracts
                </span>
              )
            ) : (
              <span>—</span>
            )}
          </p>
        </div>
      </div>
    </section>
  )
}

export default ContractsFilterToolbar
