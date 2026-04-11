import { motion, useReducedMotion } from 'framer-motion'
import { FileText } from 'lucide-react'
import env from '@/config/env'
import { cn } from '@/utils/cn'

const TAGLINE = 'Manage contracts efficiently and securely'

const AuthLayout = ({ children, className }) => {
  const reduceMotion = useReducedMotion()

  return (
    <div
      className={cn(
        'min-h-screen min-h-[100dvh] bg-gradient-to-br from-muted/80 via-background to-primary/[0.07]',
        'dark:from-background dark:via-background dark:to-primary/10',
        className
      )}
    >
      <div className="grid min-h-screen min-h-[100dvh] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <aside
          className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/[0.07] to-sky-500/10 opacity-95" />
          <div
            className="absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
            style={{
              backgroundImage:
                'radial-gradient(hsl(var(--foreground) / 0.07) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl dark:bg-primary/10" />

          <div className="relative z-10 flex flex-1 flex-col justify-center px-12 py-16 xl:px-20 xl:py-20">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                <FileText className="h-6 w-6" aria-hidden />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground xl:text-2xl">
                {env.appName}
              </span>
            </div>
            <h2 className="mt-12 max-w-lg text-3xl font-bold leading-tight tracking-tight text-foreground xl:text-4xl">
              Contract management, simplified.
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">{TAGLINE}</p>
          </div>

          <div className="relative z-10 border-t border-white/10 px-12 py-6 text-xs text-muted-foreground/90 xl:px-20 dark:border-white/5">
            Secure access · Role-based permissions · Audit-ready workflows
          </div>
        </aside>

        <div className="flex min-h-screen min-h-[100dvh] flex-col bg-background/40 backdrop-blur-[2px] dark:bg-background/60">
          <div className="flex items-center gap-3 border-b border-border/50 bg-background/90 px-4 py-3.5 shadow-sm backdrop-blur-md sm:px-6 lg:hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
              <FileText className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{env.appName}</p>
              <p className="truncate text-xs text-muted-foreground">{TAGLINE}</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-12 xl:px-16 2xl:px-24">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduceMotion ? { duration: 0 } : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
              }
              className="mx-auto w-full max-w-md"
            >
              {children}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
