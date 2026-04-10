import { cn } from '@/utils/cn'

const Badge = ({ className, variant = 'default', ...props }) => {
  const variants = {
    default: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-secondary text-secondary-foreground border-secondary',
    destructive: 'bg-destructive/10 text-destructive border-destructive/20',
    outline: 'bg-transparent border-border text-foreground',
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant] || variants.default,
        className
      )}
      {...props}
    />
  )
}

export { Badge }
