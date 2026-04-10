import { memo, useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import EmptyState from '@/components/common/EmptyState'
import { ChevronLeft, ChevronRight, FileX } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Generic data table with pagination.
 * @param {Array} columns - [{ key, header, render?, className? }]
 * @param {Array} data    - Array of row objects
 * @param {Object} pagination - { page, totalPages, onPageChange, total?, pageSize? }
 * @param {boolean} isLoading
 * @param {string} emptyTitle
 * @param {node} emptyAction
 */
const DataTable = memo(
  ({
    columns = [],
    data = [],
    pagination,
    isLoading = false,
    emptyTitle = 'No records found',
    emptyDescription,
    emptyAction,
    className,
    skeletonRowCount = 8,
  }) => {
    const { page, totalPages, onPageChange, total, pageSize: pageSizeProp } = pagination || {}
    const pageSize = pageSizeProp ?? 10
    const effectiveTotalPages = Math.max(1, totalPages ?? 1)
    const showPager =
      pagination &&
      onPageChange &&
      (typeof total === 'number' || (totalPages != null && totalPages > 1))

    const [pageInput, setPageInput] = useState(() => String(page ?? 1))
    useEffect(() => {
      setPageInput(String(page ?? 1))
    }, [page])

    const commitPage = () => {
      if (!onPageChange) return
      const n = Number.parseInt(pageInput, 10)
      if (Number.isNaN(n)) {
        setPageInput(String(page))
        return
      }
      const clamped = Math.min(Math.max(1, n), effectiveTotalPages)
      if (clamped !== page) onPageChange(clamped)
      setPageInput(String(clamped))
    }

    const rangeStart = typeof total === 'number' && total > 0 ? (page - 1) * pageSize + 1 : 0
    const rangeEnd =
      typeof total === 'number' && total > 0 ? Math.min(page * pageSize, total) : 0

    return (
      <div className={cn('space-y-4', className)}>
        <div
          className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm"
          role={isLoading ? 'status' : undefined}
          aria-busy={isLoading || undefined}
          aria-label={isLoading ? 'Loading table data' : undefined}
        >
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.key} className={col.headerClassName}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: skeletonRowCount }).map((_, rowIndex) => (
                  <TableRow key={`sk-${rowIndex}`}>
                    {columns.map((col) => (
                      <TableCell key={col.key} className={col.className}>
                        {col.key === 'actions' ? (
                          <div className="flex justify-end gap-1">
                            <Skeleton className="h-8 w-8 shrink-0" />
                            <Skeleton className="h-8 w-8 shrink-0" />
                            <Skeleton className="h-8 w-8 shrink-0" />
                          </div>
                        ) : (
                          <Skeleton
                            className={cn(
                              'h-4 w-full',
                              col.key === 'title' ? 'max-w-[min(220px,100%)]' : 'max-w-[100px]'
                            )}
                          />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 p-0">
                    <EmptyState
                      icon={FileX}
                      title={emptyTitle}
                      description={emptyDescription}
                      action={emptyAction}
                      className="border-0 rounded-none"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, rowIndex) => (
                  <TableRow key={row.id || rowIndex}>
                    {columns.map((col) => (
                      <TableCell key={col.key} className={col.className}>
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {showPager && (
          <div
            className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/15 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4"
            aria-label="Table pagination"
          >
            <p className="text-sm text-muted-foreground">
              {typeof total === 'number' ? (
                total > 0 ? (
                  <>
                    Showing{' '}
                    <span className="font-medium tabular-nums text-foreground">
                      {rangeStart}–{rangeEnd}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium tabular-nums text-foreground">{total}</span>
                  </>
                ) : (
                  <>No results</>
                )
              ) : (
                <>
                  Page{' '}
                  <span className="font-medium tabular-nums text-foreground">{page}</span> of{' '}
                  <span className="font-medium tabular-nums text-foreground">
                    {effectiveTotalPages}
                  </span>
                </>
              )}
            </p>
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <span className="hidden sm:inline">Page</span>
                <Input
                  type="text"
                  inputMode="numeric"
                  aria-label="Go to page"
                  disabled={effectiveTotalPages <= 1 || (typeof total === 'number' && total === 0)}
                  className="h-8 w-14 px-2 text-center tabular-nums"
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ''))}
                  onBlur={commitPage}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      commitPage()
                    }
                  }}
                />
                <span className="tabular-nums">/ {effectiveTotalPages}</span>
              </div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page <= 1 || (typeof total === 'number' && total === 0)}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= effectiveTotalPages || (typeof total === 'number' && total === 0)}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
)

DataTable.displayName = 'DataTable'

export default DataTable
