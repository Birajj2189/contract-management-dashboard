import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Server-side pagination footer (matches parties/contracts UX).
 */
const UserPagination = ({ page, totalPages, total, pageSize, onPageChange }) => {
  const effectiveTotalPages = Math.max(1, totalPages ?? 1)
  const [pageInput, setPageInput] = useState(() => String(page ?? 1))

  useEffect(() => {
    setPageInput(String(page ?? 1))
  }, [page])

  const commitPage = () => {
    const n = Number.parseInt(pageInput, 10)
    if (Number.isNaN(n)) {
      setPageInput(String(page))
      return
    }
    const clamped = Math.min(Math.max(1, n), effectiveTotalPages)
    if (clamped !== page) onPageChange(clamped)
    setPageInput(String(clamped))
  }

  if (total <= 0) return null

  const rangeStart = (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, total)

  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/15 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4"
      aria-label="Users pagination"
    >
      <p className="text-sm text-muted-foreground">
        Showing{' '}
        <span className="font-medium tabular-nums text-foreground">
          {rangeStart}–{rangeEnd}
        </span>{' '}
        of <span className="font-medium tabular-nums text-foreground">{total}</span>
      </p>
      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span className="hidden sm:inline">Page</span>
          <Input
            type="text"
            inputMode="numeric"
            aria-label="Go to page"
            disabled={effectiveTotalPages <= 1}
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
            disabled={page <= 1}
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
            disabled={page >= effectiveTotalPages}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default UserPagination
