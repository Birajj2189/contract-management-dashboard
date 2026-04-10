import { motion, useReducedMotion } from 'framer-motion'
import { Skeleton } from '@/components/ui/Skeleton'
import { easeOut } from '@/components/motion/motionConfig'

/**
 * Lazy-route Suspense fallback — mirrors a generic app page shell.
 */
const RouteFallback = () => {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className="flex flex-col gap-6"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.2, ease: easeOut }}
      role="status"
      aria-label="Loading page"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 max-w-[80vw]" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-9 w-32 shrink-0 rounded-md" />
      </div>
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </motion.div>
  )
}

export default RouteFallback
