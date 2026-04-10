import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setCredentials, setInitializing } from '@/store/slices/authSlice'
import authService from '@/services/authService'

/**
 * Runs once on mount to restore the auth session from the HttpOnly refresh cookie.
 * Calls GET /api/auth/me which will trigger the axios interceptor to silently
 * refresh the access token if needed.
 */
const AppInitializer = ({ children }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await authService.getMe()
        const { user, accessToken } = res.data.data
        dispatch(setCredentials({ user, accessToken }))
      } catch {
        dispatch(setInitializing(false))
      }
    }

    initAuth()
  }, [dispatch])

  return children
}

export default AppInitializer
