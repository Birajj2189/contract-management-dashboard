import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { easeOut } from '@/components/motion/motionConfig'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

/**
 * Mobile navigation drawer with Framer Motion enter/exit (overlay + panel).
 */
const MobileNavDrawer = ({ open, onOpenChange, children, className }) => {
  const reduceMotion = useReducedMotion()
  const titleId = useId()
  const closeRef = useRef(null)

  const overlayTransition = reduceMotion
    ? { duration: 0.12 }
    : { duration: 0.32, ease: easeOut }

  const panelTransition = reduceMotion
    ? { duration: 0.15, ease: easeOut }
    : { type: 'spring', damping: 32, stiffness: 420, mass: 0.88 }

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onOpenChange])

  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => closeRef.current?.focus())
      return () => cancelAnimationFrame(id)
    }
  }, [open])

  const mount = typeof document !== 'undefined' ? document.body : null
  if (!mount) return null

  return createPortal(
    <AnimatePresence mode="sync">
      {open && (
        <motion.div
          key="mobile-nav-overlay"
          role="presentation"
          aria-hidden
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[3px] lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayTransition}
          onClick={() => onOpenChange(false)}
        />
      )}
      {open && (
        <motion.div
          key="mobile-nav-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={cn(
            'fixed inset-y-0 left-0 z-[51] flex h-full w-[min(18rem,88vw)] max-w-full flex-col overflow-hidden border-r border-border/60 bg-background shadow-2xl shadow-black/10 lg:hidden',
            className
          )}
          initial={reduceMotion ? { opacity: 0 } : { x: '-104%' }}
          animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { x: '-104%' }}
          transition={panelTransition}
        >
          <span id={titleId} className="sr-only">
            Main navigation
          </span>
          <button
            ref={closeRef}
            type="button"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon' }),
              'absolute right-3 top-3 z-10 h-9 w-9 text-muted-foreground opacity-90',
              'transition-[background-color,opacity,transform] duration-200 ease-out',
              'hover:scale-105 hover:bg-muted hover:opacity-100 active:scale-95',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'motion-reduce:hover:scale-100 motion-reduce:active:scale-100'
            )}
            aria-label="Close menu"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>,
    mount
  )
}

export default MobileNavDrawer
