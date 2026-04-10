import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider as ReduxProvider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import store from '@/store'
import { injectStore } from '@/services/axiosInstance'
import AppInitializer from './AppInitializer'
import env from '@/config/env'

// Inject Redux store into axios so interceptors can read/update auth state
injectStore(store)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: env.queryStaleTime,
      retry: env.queryRetry,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

const Providers = ({ children }) => (
  <ReduxProvider store={store}>
    <QueryClientProvider client={queryClient}>
      <AppInitializer>{children}</AppInitializer>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: env.toastDuration,
          style: { fontSize: '14px' },
        }}
      />
    </QueryClientProvider>
  </ReduxProvider>
)

export default Providers
