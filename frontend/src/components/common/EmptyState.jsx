import { cn } from '@/utils/cn'

const EmptyState = ({ icon: Icon, title, description, action, className }) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-14 text-center sm:py-16',
      className
    )}
  >
    {Icon && (
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/80 shadow-inner">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
    )}
    <div className="max-w-sm">
      <p className="text-base font-semibold text-foreground">{title}</p>
      {description && (
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
    </div>
    {action && <div className="mt-2">{action}</div>}
  </div>
)

export default EmptyState
