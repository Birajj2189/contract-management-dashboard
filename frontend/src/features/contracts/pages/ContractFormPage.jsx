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
import { Card, CardContent } from '@/components/ui/Card'
import { format } from 'date-fns'

const ContractFormPage = () => {
  const { id } = useParams()
  const isEdit = !!id
  const { isAdmin } = useAuth()

  const { data: contract, isLoading } = useContract(id)
  const { mutate: createContract, isPending: isCreating } = useCreateContract()
  const { mutate: updateContract, isPending: isUpdating } = useUpdateContract(id)

  if (isEdit && isLoading) return <ContractFormSkeleton />

  const defaultValues = isEdit && contract
    ? {
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
    : undefined

  const handleSubmit = (data) => {
    if (isEdit) {
      updateContract(data)
    } else {
      createContract(data)
    }
  }

  return (
    <PageWrapper
      title={isEdit ? 'Edit contract' : 'New contract'}
      description={isEdit ? 'Update contract details' : 'Fill in the details to create a new contract'}
    >
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardContent className="pt-6">
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
