import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2, Eye } from 'lucide-react'
import DataTable from '@/components/common/DataTable'
import { Button } from '@/components/ui/Button'
import StatusBadge from './StatusBadge'
import { formatDate } from '@/utils/formatDate'

const ContractTable = ({ data, isLoading, pagination, onDelete }) => {
  const navigate = useNavigate()

  const columns = [
    {
      key: 'title',
      header: 'Title',
      render: (value, row) => (
        <button
          type="button"
          className="max-w-[min(200px,45vw)] truncate rounded-md text-left text-sm font-medium text-primary underline-offset-4 transition-colors hover:bg-primary/5 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={() => navigate(`/contracts/${row.id}`)}
        >
          {value}
        </button>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'startDate',
      header: 'Start date',
      render: (value) => formatDate(value),
    },
    {
      key: 'endDate',
      header: 'End date',
      render: (value) => formatDate(value),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (value) => formatDate(value),
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'w-[100px]',
      className: 'text-right',
      render: (_value, row) => (
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={() => navigate(`/contracts/${row.id}`)}
            aria-label="View contract"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={() => navigate(`/contracts/${row.id}/edit`)}
            aria-label="Edit contract"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(row)}
            aria-label="Delete contract"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      pagination={pagination}
      emptyTitle="No contracts found"
      emptyDescription="Create your first contract to get started."
    />
  )
}

export default ContractTable
