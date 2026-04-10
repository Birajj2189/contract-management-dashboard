import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setCredentials, setInitializing } from '@/store/slices/authSlice'
import axiosInstance from '@/services/axiosInstance'

/**
 * Restores the session on app load using the HttpOnly refresh cookie.
 *
 * Uses GET /api/auth/session which always returns 200: either { authenticated: true, user, accessToken }
 * or { authenticated: false }. That avoids POST /refresh returning 401 for every guest visit
 * (which is not a bug, but looks like an error in server logs).
 */
const AppInitializer = ({ children }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await axiosInstance.get('/auth/session')
        const { authenticated, accessToken, user } = res.data.data

        if (authenticated && accessToken && user) {
          dispatch(setCredentials({ user, accessToken }))
        } else {
          dispatch(setInitializing(false))
        }
      } catch {
        dispatch(setInitializing(false))
      }
    }

    initAuth()
  }, [dispatch])

  return children
}

export default AppInitializer
