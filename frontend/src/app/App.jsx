import { RouterProvider } from 'react-router-dom'
import Providers from './providers'
import router from './router'
import ErrorBoundary from '@/components/common/ErrorBoundary'

const App = () => (
  <ErrorBoundary>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </ErrorBoundary>
)

export default App
