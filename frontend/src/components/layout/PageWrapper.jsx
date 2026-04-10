import { cn } from '@/utils/cn'

const PageWrapper = ({ title, description, actions, children, className }) => (
  <div className={cn('flex min-w-0 flex-col gap-6 sm:gap-8', className)}>
    {(title != null && title !== '') || actions ? (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          {title != null && title !== '' ? (
            typeof title === 'string' ? (
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem] sm:leading-tight">
                {title}
              </h1>
            ) : (
              title
            )
          ) : null}
          {description != null && description !== '' ? (
            typeof description === 'string' ? (
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
                {description}
              </p>
            ) : (
              description
            )
          ) : null}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-0.5">{actions}</div>
        )}
      </div>
    ) : null}
    {children}
  </div>
)

export default PageWrapper
