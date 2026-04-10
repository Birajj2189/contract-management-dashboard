import { useContracts } from '@/features/contracts/hooks/useContractQueries'
import DataTable from '@/components/common/DataTable'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const PartiesTable = ({ data, isLoading }) => {
  const navigate = useNavigate()

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (value) => <span className="text-muted-foreground">{value}</span>,
    },
    {
      key: 'role',
      header: 'Role',
      render: (value) => <Badge variant="secondary">{value}</Badge>,
    },
    {
      key: 'contractTitle',
      header: 'Contract',
      render: (value, row) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-auto gap-1 p-0 text-primary"
          onClick={() => navigate(`/contracts/${row.contractId}`)}
        >
          {value}
          <ExternalLink className="h-3 w-3" />
        </Button>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyTitle="No parties found"
      emptyDescription="Parties are added when creating contracts."
    />
  )
}

export default PartiesTable
