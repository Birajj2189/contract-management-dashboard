import { memo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, Pencil } from 'lucide-react'
import { TableCell, TableRow } from '@/components/ui/Table'
import { Button, buttonVariants } from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import { PartyRoleBadge } from '@/features/parties/components/PartyRoleBadge'

const PartyRow = memo(function PartyRow({ party, onRowClick }) {
  const navigate = useNavigate()

  const handleRowActivate = () => onRowClick(party)

  return (
    <TableRow
      tabIndex={0}
      className="cursor-pointer border-border/50 transition-colors hover:bg-muted/70 focus-visible:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      onClick={handleRowActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleRowActivate()
        }
      }}
    >
      <TableCell className="max-w-[min(200px,40vw)] font-medium text-foreground">
        <span className="line-clamp-2">{party.name}</span>
      </TableCell>
      <TableCell className="max-w-[min(220px,45vw)] text-muted-foreground">
        <span className="line-clamp-2">{party.email || '—'}</span>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <PartyRoleBadge role={party.role} />
      </TableCell>
      <TableCell className="max-w-[min(240px,50vw)]">
        <Link
          to={`/contracts/${party.contractId}`}
          className="line-clamp-2 font-medium text-primary underline-offset-4 transition-colors hover:text-primary/90 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          aria-label={`Open contract ${party.contractTitle}`}
        >
          {party.contractTitle}
        </Link>
      </TableCell>
      <TableCell className="w-[108px] text-right">
        <div className="flex justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            aria-label={`View ${party.name}`}
            onClick={() => navigate(`/parties/${party.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Link
            to={`/contracts/${party.contractId}/edit`}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon' }),
              'h-9 w-9 text-muted-foreground hover:text-foreground'
            )}
            aria-label={`Edit contract for ${party.name}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Pencil className="h-4 w-4" />
          </Link>
        </div>
      </TableCell>
    </TableRow>
  )
})

export default PartyRow
