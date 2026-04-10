import { Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { cn } from '@/utils/cn'

const UserSearch = ({ value, onChange, className }) => (
  <div className={cn('relative min-w-0 flex-1', className)}>
    <Search
      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      aria-hidden
    />
    <Input
      type="search"
      placeholder="Search by name or email..."
      className="h-10 rounded-xl border-border/80 bg-background/80 pl-9 shadow-sm transition-colors focus-visible:ring-2"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Search users"
    />
  </div>
)

export default UserSearch
