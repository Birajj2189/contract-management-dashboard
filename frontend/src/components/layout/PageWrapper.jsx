import { cn } from '@/utils/cn'

const PageWrapper = ({ title, description, actions, children, className }) => (
  <div className={cn('flex flex-col gap-6', className)}>
    {(title || actions) && (
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {title && <h1 className="text-xl font-semibold tracking-tight">{title}</h1>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    )}
    {children}
  </div>
)

export default PageWrapper
