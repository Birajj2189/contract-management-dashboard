import DataTable from '@/components/common/DataTable'
import StatusBadge from '@/features/contracts/components/StatusBadge'
import { formatDate } from '@/utils/formatDate'

const ReportTable = ({
  data,
  isLoading,
  variant = 'default',
  pagination,
  emptyDescription,
}) => {
  const columns = [
    {
      key: 'title',
      header: 'Contract title',
      render: (value) => (
        <span className="line-clamp-2 font-medium text-foreground">{value}</span>
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
      variant={variant}
      columns={columns}
      data={data}
      isLoading={isLoading}
      pagination={pagination}
      emptyTitle="No data for selected filters"
      emptyDescription={emptyDescription}
    />
  )
}

export default ReportTable
