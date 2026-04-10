import { Users, ShoppingBag, Store, Briefcase, Eye } from 'lucide-react'
import { cn } from '@/utils/cn'

const StatCard = ({ icon: Icon, label, value, className }) => (
  <div
    className={cn(
      'flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 px-4 py-3 shadow-sm',
      className
    )}
  >
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <Icon className="h-5 w-5" aria-hidden />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold tabular-nums tracking-tight text-foreground">{value}</p>
    </div>
  </div>
)

const PartyStats = ({ total, buyers, sellers, consultants, witnesses }) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
    <StatCard icon={Users} label="Total parties" value={total} />
    <StatCard icon={ShoppingBag} label="Buyers" value={buyers} />
    <StatCard icon={Store} label="Sellers" value={sellers} />
    <StatCard icon={Briefcase} label="Consultants" value={consultants} />
    <StatCard icon={Eye} label="Witnesses" value={witnesses} />
  </div>
)

export default PartyStats
