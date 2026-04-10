import { Button } from '@/components/ui/Button'
import { Download } from 'lucide-react'
import { formatDate } from '@/utils/formatDate'

const ExportButton = ({ data }) => {
  const handleExport = () => {
    if (!data?.length) return

    const headers = ['Title', 'Status', 'Start Date', 'End Date', 'Parties', 'Created']
    const rows = data.map((c) => [
      `"${c.title}"`,
      c.status,
      formatDate(c.startDate),
      formatDate(c.endDate),
      c.parties?.length ?? 0,
      formatDate(c.createdAt),
    ])

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `contracts-report-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={!data?.length}>
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  )
}

export default ExportButton
