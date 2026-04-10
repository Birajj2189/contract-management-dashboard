import { Users, UserCheck, Shield } from 'lucide-react'
import { cn } from '@/utils/cn'

const StatCard = ({ icon: Icon, label, value, className }) => (
  <div
    className={cn(
      'flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 px-4 py-3 shadow-sm transition-shadow hover:shadow-md',
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

const UserStats = ({ totalUsers, activeUsers, adminCount }) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
    <StatCard icon={Users} label="Total users" value={totalUsers} />
    <StatCard icon={UserCheck} label="Active users" value={activeUsers} />
    <StatCard icon={Shield} label="Admins" value={adminCount} />
  </div>
)

export default UserStats
