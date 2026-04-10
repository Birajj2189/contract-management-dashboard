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
          className="max-w-[200px] truncate text-left font-medium text-primary hover:underline"
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
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/contracts/${row.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/contracts/${row.id}/edit`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(row)}
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
