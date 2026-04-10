import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import PartyRow from '@/features/parties/components/PartyRow'
import PartyEmptyState from '@/features/parties/components/PartyEmptyState'

/**
 * @param {object[]} rows — current page of parties
 * @param {(party: object) => void} onRowClick
 * @param {'no-data' | 'no-match' | null} emptyVariant
 */
const PartyTable = ({ rows, onRowClick, emptyVariant, onClearFilters }) => (
  <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
    <Table>
      <TableHeader>
        <TableRow className="border-border/60 hover:bg-transparent">
          <TableHead className="w-[20%] min-w-[120px]">Name</TableHead>
          <TableHead className="w-[22%] min-w-[140px]">Email</TableHead>
          <TableHead className="w-[14%] whitespace-nowrap">Role</TableHead>
          <TableHead className="min-w-[160px]">Contract</TableHead>
          <TableHead className="w-[108px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {emptyVariant ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={5} className="h-auto p-0">
              <PartyEmptyState
                variant={emptyVariant}
                onClearFilters={onClearFilters}
                className="border-0 rounded-none"
              />
            </TableCell>
          </TableRow>
        ) : (
          rows.map((party) => <PartyRow key={party.id} party={party} onRowClick={onRowClick} />)
        )}
      </TableBody>
    </Table>
  </div>
)

export default PartyTable
