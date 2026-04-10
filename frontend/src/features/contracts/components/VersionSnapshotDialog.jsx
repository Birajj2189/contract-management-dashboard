import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import StatusBadge from './StatusBadge'
import { useContractVersion } from '@/features/contracts/hooks/useContractQueries'
import { formatDate, formatDateTime } from '@/utils/formatDate'
import { Users } from 'lucide-react'

/**
 * Modal that loads and displays a single contract version snapshot from the API.
 */
const VersionSnapshotDialog = ({ open, onOpenChange, contractId, versionId }) => {
  const { data, isLoading, isError } = useContractVersion(contractId, versionId)

  const snap = data?.snapshot

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,720px)] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {data ? `Version ${data.versionNumber} snapshot` : 'Version snapshot'}
          </DialogTitle>
          <DialogDescription>
            {data
              ? `Saved ${formatDateTime(data.createdAt)}${data.changedBy?.name ? ` · ${data.changedBy.name}` : ''}`
              : 'Historical contract state at this version.'}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading snapshot…</p>
        )}
        {isError && (
          <p className="text-sm text-destructive">Could not load this version.</p>
        )}
        {!isLoading && !isError && snap && (
          <div className="space-y-4 border-t border-border pt-4">
            {snap.capturedAt ? (
              <p className="text-xs text-muted-foreground">
                Snapshot captured at {formatDateTime(snap.capturedAt)}
              </p>
            ) : null}
            <div>
              <p className="text-xs text-muted-foreground">Title</p>
              <p className="text-sm font-medium">{snap.title ?? '—'}</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <StatusBadge status={snap.status} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Start</p>
                <p className="text-sm">{formatDate(snap.startDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">End</p>
                <p className="text-sm">{formatDate(snap.endDate)}</p>
              </div>
            </div>
            {snap.description ? (
              <div>
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="text-sm whitespace-pre-wrap">{snap.description}</p>
              </div>
            ) : null}
            {Array.isArray(snap.parties) && snap.parties.length > 0 ? (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Users className="h-3.5 w-3.5" aria-hidden />
                  Parties
                </p>
                <ul className="space-y-2">
                  {snap.parties.map((p, i) => (
                    <li
                      key={`${p.name}-${i}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">{p.name}</p>
                        {p.email ? (
                          <p className="text-xs text-muted-foreground">{p.email}</p>
                        ) : null}
                      </div>
                      {p.role ? (
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                          {p.role}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No parties in this snapshot.</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default VersionSnapshotDialog
