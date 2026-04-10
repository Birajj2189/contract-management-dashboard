import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  useContract,
  useContractVersions,
  useContractAudit,
  useDeleteContract,
} from '@/features/contracts/hooks/useContractQueries'
import PageWrapper from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import StatusBadge from '@/features/contracts/components/StatusBadge'
import { PageLoader } from '@/components/common/LoadingSpinner'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { formatDate, formatRelative } from '@/utils/formatDate'
import { Pencil, Trash2, History, Shield, Users } from 'lucide-react'
import { useState } from 'react'

const ContractDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data: contract, isLoading } = useContract(id)
  const { data: versions } = useContractVersions(id)
  const { data: auditLogs } = useContractAudit(id)
  const { mutate: deleteContract, isPending: isDeleting } = useDeleteContract()

  if (isLoading) return <PageLoader />
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
          <Button variant="outline" size="sm" asChild>
            <Link to={`/contracts/${id}/edit`}>
              <Pencil className="mr-1 h-4 w-4" />
              Edit
            </Link>
          </Button>
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
      <div className="grid gap-4 lg:grid-cols-3">
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="h-4 w-4" />
                Versions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {versions?.length > 0 ? (
                <div className="space-y-2">
                  {versions.slice(0, 5).map((v) => (
                    <div key={v.id} className="flex items-center justify-between text-sm">
                      <span className="font-medium">v{v.versionNumber}</span>
                      <span className="text-muted-foreground">{formatRelative(v.createdAt)}</span>
                    </div>
                  ))}
                </div>
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
      </div>

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
    </PageWrapper>
  )
}

export default ContractDetailPage
