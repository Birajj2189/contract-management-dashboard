import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import authService from '@/services/authService'
import { setCredentials, clearAuth, setInitializing } from '@/store/slices/authSlice'

export const useGetMe = () => {
  const dispatch = useDispatch()

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const res = await authService.getMe()
        const { user, accessToken } = res.data.data
        dispatch(setCredentials({ user, accessToken }))
        return user
      } catch {
        dispatch(setInitializing(false))
        return null
      }
    },
    retry: false,
    staleTime: Infinity,
  })
}

export const useLogin = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: (res) => {
      const { user, accessToken } = res.data.data
      dispatch(setCredentials({ user, accessToken }))
      queryClient.setQueryData(['auth', 'me'], user)
      toast.success(`Welcome back, ${user.name}!`)
      navigate('/dashboard', { replace: true })
    },
    onError: (err) => {
      if (!err.response) {
        toast.error('Unable to reach the server. Check your connection and try again.')
      }
      // In-app form shows a generic message for credential failures (no toast — avoids duplicate noise)
    },
  })
}

export const useRegister = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data) => authService.register(data),
    onSuccess: () => {
      toast.success('Account created! Please log in.')
      navigate('/login', { replace: true })
    },
    onError: (err) => {
      if (!err.response) {
        toast.error('Unable to reach the server. Check your connection and try again.')
      }
      // Signup form shows API or generic message inline
    },
  })
}

export const useLogout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      dispatch(clearAuth())
      queryClient.clear()
      navigate('/login', { replace: true })
    },
  })
}
