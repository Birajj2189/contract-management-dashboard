import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Label } from '@/components/ui/Label'
import StatusBadge from './StatusBadge'
import { useContractVersionDiff } from '@/features/contracts/hooks/useContractQueries'
import { formatDate, formatRelative } from '@/utils/formatDate'

const SCALAR_LABELS = {
  title: 'Title',
  description: 'Description',
  status: 'Status',
  startDate: 'Start date',
  endDate: 'End date',
  parties: 'Parties',
}

function formatScalarValue(field, value) {
  if (value === null || value === undefined || value === '') return '—'
  if (field === 'startDate' || field === 'endDate') return formatDate(value)
  return String(value)
}

const VersionDiffDialog = ({ open, onOpenChange, contractId, versions = [] }) => {
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')

  const sorted = useMemo(
    () => [...versions].sort((a, b) => a.versionNumber - b.versionNumber),
    [versions]
  )

  useEffect(() => {
    if (!open || versions.length < 2) return
    const byNum = [...versions].sort((a, b) => a.versionNumber - b.versionNumber)
    setFromId(byNum[0].id)
    setToId(byNum[byNum.length - 1].id)
  }, [open, versions])

  const { data, isLoading, isError } = useContractVersionDiff(contractId, fromId, toId, {
    enabled: open && sorted.length >= 2,
  })

  const changes = data?.changes
  const changeEntries = changes ? Object.entries(changes) : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,760px)] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compare versions</DialogTitle>
          <DialogDescription>
            Choose two saved versions to see what changed between them.
          </DialogDescription>
        </DialogHeader>

        {sorted.length < 2 ? (
          <p className="text-sm text-muted-foreground">At least two versions are required.</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="diff-from">From (older)</Label>
                <Select value={fromId} onValueChange={setFromId}>
                  <SelectTrigger id="diff-from">
                    <SelectValue placeholder="Version" />
                  </SelectTrigger>
                  <SelectContent>
                    {sorted.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        v{v.versionNumber} · {formatRelative(v.createdAt)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="diff-to">To (newer)</Label>
                <Select value={toId} onValueChange={setToId}>
                  <SelectTrigger id="diff-to">
                    <SelectValue placeholder="Version" />
                  </SelectTrigger>
                  <SelectContent>
                    {sorted.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        v{v.versionNumber} · {formatRelative(v.createdAt)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {fromId === toId ? (
              <p className="text-sm text-destructive">Pick two different versions.</p>
            ) : null}

            {isLoading ? (
              <p className="text-sm text-muted-foreground">Computing diff…</p>
            ) : null}
            {isError ? (
              <p className="text-sm text-destructive">Could not load comparison.</p>
            ) : null}

            {!isLoading && !isError && data && fromId !== toId ? (
              <div className="space-y-3 border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">
                  Comparing v{data.from.versionNumber} → v{data.to.versionNumber}
                </p>
                {changeEntries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No differences between these versions.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {changeEntries.map(([key, value]) => {
                      if (key === 'parties' && value && typeof value === 'object') {
                        return (
                          <li key={key} className="rounded-md border border-border p-3 text-sm">
                            <p className="mb-2 font-medium">{SCALAR_LABELS[key] || key}</p>
                            {Array.isArray(value.added) && value.added.length > 0 ? (
                              <p className="text-xs text-green-700 dark:text-green-400">
                                <span className="font-medium">Added:</span>{' '}
                                {value.added.join(', ')}
                              </p>
                            ) : null}
                            {Array.isArray(value.removed) && value.removed.length > 0 ? (
                              <p className="mt-1 text-xs text-destructive">
                                <span className="font-medium">Removed:</span>{' '}
                                {value.removed.join(', ')}
                              </p>
                            ) : null}
                          </li>
                        )
                      }

                      if (!value || typeof value !== 'object' || !('before' in value)) return null

                      const label = SCALAR_LABELS[key] || key
                      return (
                        <li key={key} className="rounded-md border border-border p-3 text-sm">
                          <p className="mb-2 font-medium">{label}</p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <div className="rounded bg-muted/50 p-2">
                              <p className="mb-1 text-xs text-muted-foreground">Before</p>
                              {key === 'status' ? (
                                <StatusBadge status={value.before} />
                              ) : key === 'description' ? (
                                <p className="whitespace-pre-wrap text-xs">
                                  {formatScalarValue(key, value.before)}
                                </p>
                              ) : (
                                <p className="text-xs">{formatScalarValue(key, value.before)}</p>
                              )}
                            </div>
                            <div className="rounded bg-muted/50 p-2">
                              <p className="mb-1 text-xs text-muted-foreground">After</p>
                              {key === 'status' ? (
                                <StatusBadge status={value.after} />
                              ) : key === 'description' ? (
                                <p className="whitespace-pre-wrap text-xs">
                                  {formatScalarValue(key, value.after)}
                                </p>
                              ) : (
                                <p className="text-xs">{formatScalarValue(key, value.after)}</p>
                              )}
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default VersionDiffDialog
