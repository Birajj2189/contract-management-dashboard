import { memo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'
import { ChevronLeft, ChevronRight, FileX } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Generic data table with pagination.
 * @param {Array} columns - [{ key, header, render?, className? }]
 * @param {Array} data    - Array of row objects
 * @param {Object} pagination - { page, totalPages, onPageChange }
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
  }) => {
    const { page, totalPages, onPageChange } = pagination || {}

    return (
      <div className={cn('space-y-4', className)}>
        <div className="rounded-lg border">
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
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center">
                    <div className="flex justify-center">
                      <LoadingSpinner />
                    </div>
                  </TableCell>
                </TableRow>
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

        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }
)

DataTable.displayName = 'DataTable'

export default DataTable
