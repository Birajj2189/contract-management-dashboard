import * as SheetPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

const Sheet = SheetPrimitive.Root
const SheetTrigger = SheetPrimitive.Trigger
const SheetClose = SheetPrimitive.Close
const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = ({ className, ...props }) => (
  <SheetPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]',
      'transition-opacity duration-200',
      'data-[state=open]:opacity-100 data-[state=closed]:opacity-0',
      className
    )}
    {...props}
  />
)

const SheetContent = ({ side = 'left', className, children, ...props }) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      className={cn(
        'fixed z-50 flex flex-col bg-background shadow-xl outline-none',
        'border-border/80 transition-transform duration-300 ease-out will-change-transform',
        side === 'left' &&
          'inset-y-0 left-0 h-full w-[min(18rem,88vw)] max-w-full border-r data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0',
        side === 'right' &&
          'inset-y-0 right-0 h-full w-[min(18rem,88vw)] max-w-full border-l data-[state=closed]:translate-x-full data-[state=open]:translate-x-0',
        className
      )}
      {...props}
    >
      {children}
      <SheetPrimitive.Close
        className={cn(
          'absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground opacity-80',
          'ring-offset-background transition-all hover:bg-muted hover:opacity-100',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
        )}
        aria-label="Close menu"
      >
        <X className="h-4 w-4" />
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
)

const SheetTitle = ({ className, ...props }) => (
  <SheetPrimitive.Title
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
)

const SheetDescription = ({ className, ...props }) => (
  <SheetPrimitive.Description className={cn('text-sm text-muted-foreground', className)} {...props} />
)

export { Sheet, SheetTrigger, SheetClose, SheetPortal, SheetOverlay, SheetContent, SheetTitle, SheetDescription }
