import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  useContract,
  useContractVersions,
  useContractAudit,
  useDeleteContract,
} from '@/features/contracts/hooks/useContractQueries'
import PageWrapper from '@/components/layout/PageWrapper'
import { Button, buttonVariants } from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import StatusBadge from '@/features/contracts/components/StatusBadge'
import VersionSnapshotDialog from '@/features/contracts/components/VersionSnapshotDialog'
import VersionDiffDialog from '@/features/contracts/components/VersionDiffDialog'
import ContractDetailSkeleton from '@/components/skeletons/ContractDetailSkeleton'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { formatDate, formatRelative } from '@/utils/formatDate'
import { Pencil, Trash2, History, Shield, Users, ChevronRight, GitCompare } from 'lucide-react'
import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const ContractDetailPage = () => {
  const reduceMotion = useReducedMotion()
  const { id } = useParams()
  const navigate = useNavigate()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [viewVersionId, setViewVersionId] = useState(null)
  const [diffOpen, setDiffOpen] = useState(false)

  const { data: contract, isLoading } = useContract(id)
  const { data: versions } = useContractVersions(id)
  const { data: auditLogs } = useContractAudit(id)
  const { mutate: deleteContract, isPending: isDeleting } = useDeleteContract()

  if (isLoading) return <ContractDetailSkeleton />
  if (!contract) return null

  const handleDelete = () => {
    deleteContract(id, {
      onSuccess: () => navigate('/contracts'),
      onSettled: () => setDeleteOpen(false),
    })
  }

  return (
    <PageWrapper
      title={contract.title}
      description={`Contract · Created ${formatRelative(contract.createdAt)}`}
      actions={
        <div className="flex gap-2">
          <Link
            to={`/contracts/${id}/edit`}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            <Pencil className="mr-1 h-4 w-4" />
            Edit
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Delete
          </Button>
        </div>
      }
    >
      <motion.div
        className="grid gap-4 lg:grid-cols-3"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.26, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Main info */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusBadge status={contract.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Start date</span>
                <span className="text-sm font-medium">{formatDate(contract.startDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">End date</span>
                <span className="text-sm font-medium">{formatDate(contract.endDate)}</span>
              </div>
              {contract.description && (
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{contract.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Parties */}
          {contract.parties?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4" />
                  Parties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contract.parties.map((party) => (
                    <div key={party.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium">{party.name}</p>
                        <p className="text-xs text-muted-foreground">{party.email}</p>
                      </div>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                        {party.role}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Versions */}
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="h-4 w-4" />
                Versions
              </CardTitle>
              {versions?.length >= 2 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => setDiffOpen(true)}
                >
                  <GitCompare className="mr-1 h-3.5 w-3.5" />
                  Compare
                </Button>
              ) : null}
            </CardHeader>
            <CardContent>
              {versions?.length > 0 ? (
                <>
                  <p className="mb-2 text-xs text-muted-foreground">
                    Select a version to view its saved snapshot.
                  </p>
                  <ul className="max-h-64 space-y-1 overflow-y-auto pr-1">
                    {versions.map((v) => (
                      <li key={v.id}>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={() => setViewVersionId(v.id)}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="font-medium">v{v.versionNumber}</span>
                            {v.changedBy?.name ? (
                              <span className="truncate text-xs text-muted-foreground">
                                {v.changedBy.name}
                              </span>
                            ) : null}
                          </span>
                          <span className="flex shrink-0 items-center gap-1 text-muted-foreground">
                            <span className="text-xs">{formatRelative(v.createdAt)}</span>
                            <ChevronRight className="h-4 w-4 opacity-60" aria-hidden />
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No versions yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Audit log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4" />
                Audit trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              {auditLogs?.length > 0 ? (
                <div className="space-y-2">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="text-sm">
                      <p className="font-medium">{log.action}</p>
                      <p className="text-xs text-muted-foreground">{formatRelative(log.createdAt)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No audit entries.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete contract"
        description="This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />

      <VersionSnapshotDialog
        open={!!viewVersionId}
        onOpenChange={(open) => {
          if (!open) setViewVersionId(null)
        }}
        contractId={id}
        versionId={viewVersionId}
      />

      <VersionDiffDialog
        open={diffOpen}
        onOpenChange={setDiffOpen}
        contractId={id}
        versions={versions ?? []}
      />
    </PageWrapper>
  )
}

export default ContractDetailPage
