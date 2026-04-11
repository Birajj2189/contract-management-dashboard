import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Prefer browser back within the SPA stack; if this is the first history entry (deep link),
 * go to `fallbackTo`. When `idx` is absent, a normal `navigate(-1)` is used.
 */
export function navigateSmartBack(navigate, fallbackTo) {
  const idx = window.history.state?.idx
  if (typeof idx === 'number' && idx === 0) {
    navigate(fallbackTo)
    return
  }
  navigate(-1)
}

const PageBackButton = ({ fallbackTo = '/dashboard', className, label = 'Back' }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigateSmartBack(navigate, fallbackTo)
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        '-ml-2 h-9 gap-1.5 text-muted-foreground hover:text-foreground',
        className
      )}
      onClick={handleClick}
    >
      <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
      {label}
    </Button>
  )
}

export default PageBackButton
