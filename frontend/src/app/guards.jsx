import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  selectIsAuthenticated,
  selectIsInitializing,
  selectUserRole,
} from '@/store/slices/authSlice'
import { PageLoader } from '@/components/common/LoadingSpinner'

export const ProtectedRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isInitializing = useSelector(selectIsInitializing)

  if (isInitializing) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export const PublicOnlyRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isInitializing = useSelector(selectIsInitializing)

  if (isInitializing) {
    return <PageLoader />
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export const RoleGuard = ({ requiredRole }) => {
  const role = useSelector(selectUserRole)

  if (role !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
