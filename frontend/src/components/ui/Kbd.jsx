import { cn } from '@/utils/cn'

/**
 * Styled keyboard key for shortcut hints (sidebar, help dialog).
 */
const Kbd = ({ className, children, ...props }) => (
  <kbd
    className={cn(
      'inline-flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded border border-border/80 bg-muted/90 px-1.5 font-mono text-[0.65rem] font-semibold uppercase text-muted-foreground shadow-sm',
      className
    )}
    {...props}
  >
    {children}
  </kbd>
)

export { Kbd }
