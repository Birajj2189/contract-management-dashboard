import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ExternalLink, Pencil } from 'lucide-react'
import PageWrapper from '@/components/layout/PageWrapper'
import { Button, buttonVariants } from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Separator } from '@/components/ui/Separator'
import { PartyRoleBadge } from '@/features/parties/components/PartyRoleBadge'
import { usePartyDetail } from '@/features/parties/hooks/usePartyDetail'

const PartyDetailPage = () => {
  const { partyId } = useParams()
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const { party, isLoading, isFetching, isError, isNotFound, refetch } = usePartyDetail(partyId)

  const showSkeleton = (isLoading || isFetching) && !party && !isNotFound

  if (!partyId) {
    return <Navigate to="/parties" replace />
  }

  if (isError) {
    return (
      <PageWrapper className="mx-auto max-w-7xl" title="Party" description="">
        <div
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          Something went wrong loading this party.
          <Button type="button" variant="outline" size="sm" className="ml-3 h-8" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </PageWrapper>
    )
  }

  if (isNotFound) {
    return (
      <PageWrapper
        className="mx-auto max-w-7xl"
        title="Party not found"
        description="This party may have been removed or the link is invalid."
        actions={
          <Link
            to="/parties"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            Back to parties
          </Link>
        }
      >
        <Card className="max-w-lg border-dashed">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Return to the parties list to pick a valid record, or open the contract this party was
            attached to.
          </CardContent>
        </Card>
      </PageWrapper>
    )
  }

  if (showSkeleton) {
    return (
      <PageWrapper className="mx-auto max-w-7xl" title="Party" description="">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-48 w-full max-w-2xl rounded-xl" />
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper
      className="mx-auto max-w-7xl"
      title={party.name}
      description="Party details and linked contract"
      actions={
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back
          </Button>
          <Link
            to={`/contracts/${party.contractId}/edit`}
            className={cn(buttonVariants({ variant: 'default', size: 'sm' }))}
          >
            <Pencil className="mr-1.5 h-4 w-4" />
            Edit on contract
          </Link>
        </div>
      }
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.22 }}
        className="max-w-2xl space-y-6"
      >
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Contact</CardTitle>
            <CardDescription>Information stored on the contract record.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Email
              </span>
              <span className="text-sm text-foreground">{party.email || '—'}</span>
            </div>
            <Separator />
            <div className="grid gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Role
              </span>
              <div>
                <PartyRoleBadge role={party.role} />
              </div>
            </div>
            <Separator />
            <div className="grid gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Contract
              </span>
              <Link
                to={`/contracts/${party.contractId}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                {party.contractTitle}
                <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden />
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </PageWrapper>
  )
}

export default PartyDetailPage
