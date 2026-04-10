import { motion, useReducedMotion } from 'framer-motion'
import { easeOut } from './motionConfig'

const listVariants = (reduce) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: reduce ? 0 : 0.05,
      delayChildren: reduce ? 0 : 0.02,
    },
  },
})

const itemVariants = (reduce) => ({
  hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: reduce ? 0 : 0.24, ease: easeOut },
  },
})

export const StaggerContainer = ({ className, children }) => {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={listVariants(!!reduce)}
    >
      {children}
    </motion.div>
  )
}

export const StaggerItem = ({ className, children }) => {
  const reduce = useReducedMotion()
  return (
    <motion.div className={className} variants={itemVariants(!!reduce)}>
      {children}
    </motion.div>
  )
}
