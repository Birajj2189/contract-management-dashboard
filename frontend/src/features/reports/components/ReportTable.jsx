import DataTable from '@/components/common/DataTable'
import StatusBadge from '@/features/contracts/components/StatusBadge'
import { formatDate } from '@/utils/formatDate'

const ReportTable = ({ data, isLoading }) => {
  const columns = [
    {
      key: 'title',
      header: 'Contract title',
      render: (value) => <span className="font-medium">{value}</span>,
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
      key: 'parties',
      header: 'Parties',
      render: (value) => <span>{value?.length ?? 0}</span>,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (value) => formatDate(value),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyTitle="No data for selected filters"
    />
  )
}

export default ReportTable
