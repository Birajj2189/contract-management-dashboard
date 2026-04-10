import { Users, SearchX, UserPlus } from 'lucide-react'
import EmptyState from '@/components/common/EmptyState'
import { Button } from '@/components/ui/Button'

/**
 * @param {'no-data' | 'no-match'} variant
 */
const UserEmptyState = ({ variant, onClearFilters, onAddUser, className }) => {
  if (variant === 'no-match') {
    return (
      <EmptyState
        icon={SearchX}
        title="No matching users"
        description="Try adjusting search, role, or status filters."
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
      title="No users yet"
      description="Invite team members so they can collaborate on contracts."
      className={className}
      action={
        onAddUser ? (
          <Button type="button" variant="default" size="sm" className="gap-2" onClick={onAddUser}>
            <UserPlus className="h-4 w-4" />
            Add user
          </Button>
        ) : null
      }
    />
  )
}

export default UserEmptyState
