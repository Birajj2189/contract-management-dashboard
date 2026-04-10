import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider as ReduxProvider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/store/slices/authSlice'
import uiReducer from '@/store/slices/uiSlice'
import notificationsReducer from '@/store/slices/notificationsSlice'

export const createTestStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
      notifications: notificationsReducer,
    },
    preloadedState,
  })

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

export const renderWithProviders = (
  ui,
  { preloadedState = {}, initialEntries = ['/'], ...options } = {}
) => {
  const store = createTestStore(preloadedState)
  const queryClient = createTestQueryClient()

  const Wrapper = ({ children }) => (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </QueryClientProvider>
    </ReduxProvider>
  )

  return { store, queryClient, ...render(ui, { wrapper: Wrapper, ...options }) }
}
