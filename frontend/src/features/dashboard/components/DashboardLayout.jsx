/**
 * Dashboard content grid: stats row + chart / recent split.
 * Shell max-width is applied at page level; this handles vertical rhythm.
 */
const DashboardLayout = ({ stats, main }) => (
  <div className="mx-auto w-full min-w-0 max-w-7xl space-y-6">
    {stats}
    <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-5">{main}</div>
  </div>
)

export default DashboardLayout
