import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/utils/cn'

/**
 * Inner surface for Radix dropdown content — spring open for a smoother toggle feel.
 * Parent DropdownMenuContent should use p-0; padding lives on this wrapper.
 */
const AnimatedDropdownSurface = ({ children, className }) => {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 420, damping: 30, mass: 0.65 }
      }
      className={cn('overflow-hidden rounded-md p-1', className)}
    >
      {children}
    </motion.div>
  )
}

export default AnimatedDropdownSurface
