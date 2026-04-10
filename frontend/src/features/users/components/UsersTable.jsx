import { formatDate } from '@/utils/formatDate'
import { Badge } from '@/components/ui/Badge'
import DataTable from '@/components/common/DataTable'

const UsersTable = ({ data, isLoading }) => {
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
      render: (value) => (
        <Badge variant={value === 'ADMIN' ? 'default' : 'secondary'} className="uppercase">
          {value}
        </Badge>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (value) => (
        <Badge variant={value ? 'success' : 'destructive'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (value) => formatDate(value),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyTitle="No users found"
    />
  )
}

export default UsersTable
