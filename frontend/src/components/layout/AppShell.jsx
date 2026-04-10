import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import AnimatedOutlet from '@/components/motion/AnimatedOutlet'
import Sidebar from './Sidebar'
import Header from './Header'
import KeyboardShortcutsDialog from './KeyboardShortcutsDialog'
import MobileNavDrawer from './MobileNavDrawer'
import { selectSidebarOpen, setSidebarOpen } from '@/store/slices/uiSlice'
import { useMinWidth } from '@/hooks/useBreakpoint'
import { useNavigationShortcuts } from '@/hooks/useNavigationShortcuts'

const LG = 1024

const AppShell = () => {
  const location = useLocation()
  const dispatch = useDispatch()
  const mobileNavOpen = useSelector(selectSidebarOpen)
  const isLargeScreen = useMinWidth(LG)
  const { helpOpen, setHelpOpen } = useNavigationShortcuts()

  useEffect(() => {
    dispatch(setSidebarOpen(false))
  }, [location.pathname, dispatch])

  useEffect(() => {
    if (isLargeScreen) dispatch(setSidebarOpen(false))
  }, [isLargeScreen, dispatch])

  return (
    <div className="flex h-svh min-h-0 w-full max-w-[100vw] overflow-hidden bg-muted/40">
      <div className="hidden h-full min-h-0 shrink-0 lg:flex lg:border-r lg:border-border/60 lg:bg-card/50 lg:shadow-sm">
        <Sidebar mode="desktop" onOpenShortcutHelp={() => setHelpOpen(true)} />
      </div>

      <MobileNavDrawer
        open={mobileNavOpen && !isLargeScreen}
        onOpenChange={(next) => dispatch(setSidebarOpen(next))}
      >
        <Sidebar mode="sheet" onNavigate={() => dispatch(setSidebarOpen(false))} />
      </MobileNavDrawer>

      <KeyboardShortcutsDialog open={helpOpen} onOpenChange={setHelpOpen} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Header />
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full min-w-0 max-w-7xl px-4 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
            <AnimatedOutlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppShell
