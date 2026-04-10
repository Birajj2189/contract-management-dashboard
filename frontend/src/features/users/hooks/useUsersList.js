import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/services/axiosInstance'
import env from '@/config/env'

/**
 * @param {{ search?: string, role?: string, status?: string, page: number, limit?: number }} params
 */
export function useUsersList(params) {
  const { search, role, status, page, limit = env.pageSize } = params

  return useQuery({
    queryKey: ['users', { search: search || '', role: role || 'ALL', status: status || 'all', page, limit }],
    queryFn: async () => {
      const query = {
        page,
        limit,
        status: status || 'all',
      }
      if (search?.trim()) query.search = search.trim()
      if (role && role !== 'ALL') query.role = role

      const { data } = await axiosInstance.get('/users', { params: query })
      return {
        users: data.data.users,
        meta: data.meta,
      }
    },
    placeholderData: (previousData) => previousData,
    staleTime: env.queryStaleTime,
  })
}
