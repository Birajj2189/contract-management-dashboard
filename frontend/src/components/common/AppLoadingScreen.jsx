import { FileText } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import env from '@/config/env'
import { cn } from '@/utils/cn'
import { easeOut } from '@/components/motion/motionConfig'

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
}

const ORBIT_MASK = {
  background:
    'conic-gradient(from 0deg, hsl(var(--primary) / 0.95) 0deg, hsl(var(--primary) / 0.2) 65deg, transparent 65deg 360deg)',
  mask: 'radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2px))',
  WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2px))',
}

/**
 * Centered full-viewport loader for route transitions and auth bootstrap.
 * @param {'embedded' | 'fullscreen'} variant
 */
const AppLoadingScreen = ({ variant = 'embedded', className }) => {
  const reduceMotion = useReducedMotion()
  const isFull = variant === 'fullscreen'

  const stagger = reduceMotion ? 0 : 0.09
  const delayChild = reduceMotion ? 0 : 0.06

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.4, ease: easeOut }}
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-8',
        isFull
          ? 'bg-gradient-to-b from-background via-muted/15 to-background'
          : 'bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/55 dark:bg-background/80',
        className
      )}
      role="status"
      aria-label="Loading"
      aria-live="polite"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute left-1/2 top-1/2 h-[min(520px,95vw)] w-[min(520px,95vw)] -translate-x-1/2 -translate-y-1/2 animate-app-loader-float-a rounded-full bg-primary/[0.12] blur-3xl dark:bg-primary/20" />
        <div className="absolute bottom-0 right-0 h-[min(400px,80vw)] w-[min(400px,80vw)] translate-x-1/4 translate-y-1/4 animate-app-loader-float-b rounded-full bg-sky-400/10 blur-3xl dark:bg-sky-500/[0.12]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_45%,hsl(var(--primary)/0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_55%_45%_at_50%_45%,hsl(var(--primary)/0.12),transparent_70%)]" />
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: reduceMotion ? 0 : 0.52,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative w-full max-w-[min(20rem,calc(100vw-2.5rem))]"
      >
        <div
          className={cn(
            'relative overflow-hidden rounded-2xl border border-border/60 bg-card/95 px-9 py-10 shadow-2xl shadow-primary/[0.04] ring-1 ring-black/[0.03] dark:bg-card/92 dark:ring-white/[0.06]',
            'before:pointer-events-none before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary/35 before:to-transparent'
          )}
        >
          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary/[0.06] blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-primary/[0.05] blur-2xl" />

          <motion.div
            className="relative flex flex-col items-center text-center"
            initial={reduceMotion ? false : 'hidden'}
            animate={reduceMotion ? undefined : 'show'}
            variants={
              reduceMotion
                ? undefined
                : {
                    hidden: {},
                    show: {
                      transition: {
                        staggerChildren: stagger,
                        delayChildren: delayChild,
                      },
                    },
                  }
            }
          >
            <motion.div
              variants={reduceMotion ? undefined : itemVariants}
              className={cn(
                'mb-7 flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25',
                !reduceMotion && 'animate-app-loader-logo-float'
              )}
            >
              <FileText className="h-[1.85rem] w-[1.85rem]" strokeWidth={1.5} aria-hidden />
            </motion.div>

            <motion.p
              variants={reduceMotion ? undefined : itemVariants}
              className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
            >
              Loading
            </motion.p>

            <motion.p
              variants={reduceMotion ? undefined : itemVariants}
              className="mt-2 text-lg font-semibold tracking-tight text-foreground sm:text-[1.35rem]"
            >
              {env.appName}
            </motion.p>

            <motion.p
              variants={reduceMotion ? undefined : itemVariants}
              className="mt-2 max-w-[16rem] text-sm leading-relaxed text-muted-foreground"
            >
              Preparing your workspace
            </motion.p>

            <motion.div
              variants={reduceMotion ? undefined : itemVariants}
              className="mt-9 flex w-full flex-col items-center gap-5"
            >
              <div className="relative h-[3.25rem] w-[3.25rem]" aria-hidden>
                <div
                  className="absolute inset-0 animate-app-loader-spin-smooth motion-reduce:animate-none rounded-full"
                  style={{
                    ...ORBIT_MASK,
                    animationDuration: '1.15s',
                  }}
                />
                <div className="absolute inset-[5px] rounded-full bg-card dark:bg-card" />
              </div>

              <div className="h-1 w-full max-w-[11rem] overflow-hidden rounded-full bg-muted/80 dark:bg-muted/50">
                <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-transparent via-primary to-transparent animate-app-loader-shimmer-bar motion-reduce:animate-none" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default AppLoadingScreen
