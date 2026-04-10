import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/services/axiosInstance'
import PageWrapper from '@/components/layout/PageWrapper'
import UsersTable from '@/features/users/components/UsersTable'
import { Input } from '@/components/ui/Input'
import { Search } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import env from '@/config/env'

const useUsers = () =>
  useQuery({
    queryKey: ['users'],
    queryFn: () => axiosInstance.get('/users').then((r) => r.data.data),
    staleTime: env.queryStaleTime,
  })

const UsersPage = () => {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, env.debounceDelay)
  const { data: users = [], isLoading } = useUsers()

  const filtered = debouncedSearch
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          u.email.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : users

  return (
    <PageWrapper title="Users" description="Manage user accounts and roles">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <UsersTable data={filtered} isLoading={isLoading} />
    </PageWrapper>
  )
}

export default UsersPage
