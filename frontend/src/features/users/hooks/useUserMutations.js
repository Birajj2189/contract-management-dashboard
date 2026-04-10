import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '@/services/axiosInstance'
import toast from 'react-hot-toast'

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, body }) => {
      const { data } = await axiosInstance.patch(`/users/${userId}`, body)
      return data.data.user
    },
    onSuccess: (_user, { userId }) => {
      qc.invalidateQueries({ queryKey: ['users'] })
      qc.invalidateQueries({ queryKey: ['user', userId] })
    },
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body) => {
      const { data } = await axiosInstance.post('/users', body)
      return data.data.user
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('User created successfully.')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error?.message || 'Failed to create user.')
    },
  })
}
