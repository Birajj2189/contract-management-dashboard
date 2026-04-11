import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import PageWrapper from '@/components/layout/PageWrapper'
import ContractForm from '@/features/contracts/components/ContractForm'
import { useAuth } from '@/hooks/useAuth'
import {
  useContract,
  useCreateContract,
  useUpdateContract,
} from '@/features/contracts/hooks/useContractQueries'
import ContractFormSkeleton from '@/components/skeletons/ContractFormSkeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { format } from 'date-fns'

const ContractFormPage = () => {
  const { id } = useParams()
  const isEdit = !!id
  const { isAdmin } = useAuth()

  const { data: contract, isLoading } = useContract(id)
  const { mutate: createContract, isPending: isCreating } = useCreateContract()
  const { mutate: updateContract, isPending: isUpdating } = useUpdateContract(id)

  const defaultValues = useMemo(() => {
    if (!(isEdit && contract)) return undefined
    return {
      title: contract.title,
      description: contract.description || '',
      startDate: contract.startDate ? format(new Date(contract.startDate), 'yyyy-MM-dd') : '',
      endDate: contract.endDate ? format(new Date(contract.endDate), 'yyyy-MM-dd') : '',
      status: contract.status,
      parties:
        Array.isArray(contract.parties) && contract.parties.length > 0
          ? contract.parties.map((p) => ({
              name: p.name ?? '',
              email: p.email ?? '',
              role: p.role ?? '',
            }))
          : [{ name: '', email: '', role: '' }],
    }
  }, [isEdit, contract])

  if (isEdit && isLoading) return <ContractFormSkeleton />

  const handleSubmit = (data) => {
    if (isEdit) {
      updateContract(data)
    } else {
      createContract(data)
    }
  }

  return (
    <PageWrapper
      backFallback="/contracts"
      title={isEdit ? 'Edit contract' : 'New contract'}
      description={
        isEdit
          ? 'Update the record below. Changes are saved as a new version when you submit.'
          : 'Define the agreement, term, parties, and status. Fields marked * are required.'
      }
    >
      <div className="mx-auto w-full max-w-3xl">
        <Card className="overflow-hidden border-border/70 shadow-md ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
          <CardHeader className="space-y-1 border-b border-border/60 bg-muted/25 px-5 py-5 sm:px-8 sm:py-6">
            <CardTitle className="text-base font-semibold sm:text-lg">Contract details</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Use a clear title and dates. Add every party that should appear on this contract.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 py-6 sm:px-8 sm:py-8">
            <ContractForm
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              isLoading={isCreating || isUpdating}
              isEdit={isEdit}
              isAdmin={isAdmin}
            />
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}

export default ContractFormPage
