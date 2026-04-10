import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { Skeleton } from '@/components/ui/Skeleton'

const COLS = 5
const ROWS = 8

const PartySkeleton = () => (
  <div
    className="overflow-hidden rounded-xl border border-border/60 bg-card"
    role="status"
    aria-busy
    aria-label="Loading parties"
  >
    <Table>
      <TableHeader>
        <TableRow>
          {['Name', 'Email', 'Role', 'Contract', ''].map((h) => (
            <TableHead key={h || 'actions'} className={h === '' ? 'w-[120px]' : undefined}>
              {h}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: ROWS }).map((_, i) => (
          <TableRow key={i}>
            {Array.from({ length: COLS }).map((__, j) => (
              <TableCell key={j}>
                {j === COLS - 1 ? (
                  <div className="flex justify-end gap-1">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                ) : (
                  <Skeleton className={j === 0 ? 'h-4 max-w-[180px]' : 'h-4 max-w-[120px]'} />
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
)

export default PartySkeleton
