import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { Skeleton } from '@/components/ui/Skeleton'

const COLS = 6
const ROWS = 8

const UserSkeleton = () => (
  <div className="space-y-4" role="status" aria-busy aria-label="Loading users">
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 px-4 py-3"
        >
          <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      ))}
    </div>
    <div className="flex flex-col gap-4 border-b border-border/60 pb-4 sm:flex-row sm:flex-wrap">
      <Skeleton className="h-10 flex-1 rounded-xl sm:max-w-md" />
      <Skeleton className="h-10 w-full rounded-xl sm:w-40" />
      <Skeleton className="h-10 w-full rounded-xl sm:w-44" />
    </div>
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {['Name', 'Email', 'Role', 'Status', 'Joined', ''].map((h) => (
              <TableHead key={h || 'a'}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: ROWS }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: COLS }).map((__, j) => (
                <TableCell key={j}>
                  {j === COLS - 1 ? (
                    <div className="flex justify-end">
                      <Skeleton className="h-9 w-9 rounded-md" />
                    </div>
                  ) : (
                    <Skeleton className={j === 0 ? 'h-4 max-w-[160px]' : 'h-4 max-w-[100px]'} />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
)

export default UserSkeleton
