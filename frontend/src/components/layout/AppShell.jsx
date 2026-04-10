import AnimatedOutlet from '@/components/motion/AnimatedOutlet'
import { useSelector } from 'react-redux'
import Sidebar from './Sidebar'
import Header from './Header'
import { selectSidebarOpen } from '@/store/slices/uiSlice'
import { cn } from '@/utils/cn'

const AppShell = () => {
  const sidebarOpen = useSelector(selectSidebarOpen)

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      {/* Sidebar — hidden on mobile when closed */}
      <div
        className={cn(
          'hidden md:flex md:flex-col',
          !sidebarOpen && 'md:hidden'
        )}
      >
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <AnimatedOutlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppShell
