import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import { renderWithProviders } from '@/test/testUtils'
import { ProtectedRoute } from '@/app/guards'

describe('ProtectedRoute', () => {
  it('redirects unauthenticated user to /login', () => {
    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>,
      {
        initialEntries: ['/dashboard'],
        preloadedState: {
          auth: { user: null, accessToken: null, isAuthenticated: false, isInitializing: false },
        },
      }
    )
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('renders children for authenticated user', () => {
    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>,
      {
        initialEntries: ['/dashboard'],
        preloadedState: {
          auth: {
            user: { id: '1', name: 'Alice', role: 'USER' },
            accessToken: 'token',
            isAuthenticated: true,
            isInitializing: false,
          },
        },
      }
    )
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('shows loader while initializing', () => {
    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Route>
      </Routes>,
      {
        initialEntries: ['/dashboard'],
        preloadedState: {
          auth: { user: null, accessToken: null, isAuthenticated: false, isInitializing: true },
        },
      }
    )
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })
})
