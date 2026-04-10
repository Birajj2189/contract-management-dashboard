import { cn } from '@/utils/cn'

const PageWrapper = ({ title, description, actions, children, className }) => (
  <div className={cn('flex flex-col gap-6', className)}>
    {(title != null && title !== '') || actions ? (
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          {title != null && title !== '' ? (
            typeof title === 'string' ? (
              <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            ) : (
              title
            )
          ) : null}
          {description != null && description !== '' ? (
            typeof description === 'string' ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : (
              description
            )
          ) : null}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    ) : null}
    {children}
  </div>
)

export default PageWrapper
