import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute, RoleGuard } from './guards'
import RouteFallback from '@/components/skeletons/RouteFallback'

// Lazy load all pages
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'))
const AppShell = lazy(() => import('@/components/layout/AppShell'))
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const ContractsPage = lazy(() => import('@/features/contracts/pages/ContractsPage'))
const ContractDetailPage = lazy(() => import('@/features/contracts/pages/ContractDetailPage'))
const ContractFormPage = lazy(() => import('@/features/contracts/pages/ContractFormPage'))
const PartiesPage = lazy(() => import('@/features/parties/pages/PartiesPage'))
const PartyDetailPage = lazy(() => import('@/features/parties/pages/PartyDetailPage'))
const UsersPage = lazy(() => import('@/features/users/pages/UsersPage'))
const UserDetailPage = lazy(() => import('@/features/users/pages/UserDetailPage'))
const ReportsPage = lazy(() => import('@/features/reports/pages/ReportsPage'))

const withSuspense = (element) => <Suspense fallback={<RouteFallback />}>{element}</Suspense>

const router = createBrowserRouter([
  // ─── Public only (unauthenticated) ──────────────────────────────────────
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: '/login',
        element: withSuspense(<LoginPage />),
      },
      {
        path: '/register',
        element: withSuspense(<RegisterPage />),
      },
    ],
  },

  // ─── Protected routes ────────────────────────────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: withSuspense(<AppShell />),
        children: [
          {
            index: true,
            path: '/',
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: '/dashboard',
            element: withSuspense(<DashboardPage />),
          },
          {
            path: '/contracts',
            element: withSuspense(<ContractsPage />),
          },
          {
            path: '/contracts/new',
            element: withSuspense(<ContractFormPage />),
          },
          {
            path: '/contracts/:id',
            element: withSuspense(<ContractDetailPage />),
          },
          {
            path: '/contracts/:id/edit',
            element: withSuspense(<ContractFormPage />),
          },
          {
            path: '/parties',
            element: withSuspense(<PartiesPage />),
          },
          {
            path: '/parties/:partyId',
            element: withSuspense(<PartyDetailPage />),
          },
          // Admin-only routes
          {
            element: <RoleGuard requiredRole="ADMIN" />,
            children: [
              {
                path: '/users',
                element: withSuspense(<UsersPage />),
              },
              {
                path: '/users/:userId',
                element: withSuspense(<UserDetailPage />),
              },
              {
                path: '/reports',
                element: withSuspense(<ReportsPage />),
              },
            ],
          },
        ],
      },
    ],
  },

  // ─── Fallback ─────────────────────────────────────────────────────────────
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
])

export default router
