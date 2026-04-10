import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

/**
 * Consistent primary CTA for list pages (Contracts, Parties, Dashboard).
 */
const PagePrimaryAction = ({ to, children, icon: Icon = Plus, className }) => (
  <Link
    to={to}
    className={cn(
      buttonVariants({ variant: 'default', size: 'default' }),
      'h-10 min-h-10 shrink-0 gap-2 rounded-lg px-4 text-sm font-semibold shadow-sm',
      className
    )}
  >
    <Icon className="h-4 w-4 shrink-0" aria-hidden />
    {children}
  </Link>
)

export default PagePrimaryAction
