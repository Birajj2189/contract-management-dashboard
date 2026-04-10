import { useOutlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { easeOut } from './motionConfig'

/**
 * Wraps React Router outlet with a short cross-fade + slide on navigation.
 */
const AnimatedOutlet = () => {
  const location = useLocation()
  const outlet = useOutlet()
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
        transition={{
          duration: reduceMotion ? 0 : 0.22,
          ease: easeOut,
        }}
        className="min-h-0"
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  )
}

export default AnimatedOutlet
