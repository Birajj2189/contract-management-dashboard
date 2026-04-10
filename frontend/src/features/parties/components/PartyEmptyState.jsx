import { Users, SearchX } from 'lucide-react'
import EmptyState from '@/components/common/EmptyState'
import { Button, buttonVariants } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

/**
 * @param {'no-data' | 'no-match'} variant
 */
const PartyEmptyState = ({ variant, onClearFilters, className }) => {
  if (variant === 'no-match') {
    return (
      <EmptyState
        icon={SearchX}
        title="No matching parties"
        description="Try adjusting search, role, or contract filters."
        className={className}
        action={
          onClearFilters ? (
            <Button type="button" variant="outline" size="sm" onClick={onClearFilters}>
              Clear filters
            </Button>
          ) : null
        }
      />
    )
  }

  return (
    <EmptyState
      icon={Users}
      title="No parties yet"
      description="Parties are added when you create or edit a contract."
      className={className}
      action={
        <Link
          to="/contracts/new"
          className={cn(buttonVariants({ variant: 'default', size: 'sm' }))}
        >
          New contract
        </Link>
      }
    />
  )
}

export default PartyEmptyState
