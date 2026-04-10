import { Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { cn } from '@/utils/cn'

const PartySearch = ({ value, onChange, className }) => (
  <div className={cn('min-w-0 flex-1 space-y-2', className)}>
    <Label htmlFor="parties-search" className="text-xs font-medium text-muted-foreground">
      Search
    </Label>
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/80"
        aria-hidden
      />
      <Input
        id="parties-search"
        placeholder="Name or email…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-xl border-border/80 bg-background/80 pl-9 shadow-sm"
        autoComplete="off"
      />
    </div>
  </div>
)

export default PartySearch
