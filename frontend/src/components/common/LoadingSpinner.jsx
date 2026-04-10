import { cn } from '@/utils/cn'

const LoadingSpinner = ({ className, size = 'default' }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    default: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-muted-foreground/30 border-t-primary',
        sizes[size] || sizes.default,
        className
      )}
      role="status"
      aria-label="Loading"
    />
  )
}

const PageLoader = () => (
  <div className="flex h-[60vh] items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
)

const InlineLoader = ({ text = 'Loading...' }) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <LoadingSpinner size="sm" />
    <span>{text}</span>
  </div>
)

export { LoadingSpinner, PageLoader, InlineLoader }
