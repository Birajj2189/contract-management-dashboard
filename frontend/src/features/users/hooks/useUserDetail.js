import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/services/axiosInstance'
import env from '@/config/env'

export function useUserDetail(userId) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/users/${userId}`)
      return data.data.user
    },
    enabled: Boolean(userId),
    staleTime: env.queryStaleTime,
  })
}
