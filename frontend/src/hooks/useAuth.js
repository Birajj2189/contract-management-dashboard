import { useSelector, useDispatch } from 'react-redux'
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsInitializing,
  selectUserRole,
  selectAccessToken,
  clearAuth,
} from '@/store/slices/authSlice'
import authService from '@/services/authService'

export const useAuth = () => {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isInitializing = useSelector(selectIsInitializing)
  const role = useSelector(selectUserRole)
  const accessToken = useSelector(selectAccessToken)

  const isAdmin = role === 'ADMIN'

  const logout = async () => {
    try {
      await authService.logout()
    } catch (_err) {
      // Always clear local state even if server call fails
    } finally {
      dispatch(clearAuth())
    }
  }

  return {
    user,
    isAuthenticated,
    isInitializing,
    role,
    accessToken,
    isAdmin,
    logout,
  }
}
