import * as SheetPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

const Sheet = SheetPrimitive.Root
const SheetTrigger = SheetPrimitive.Trigger
const SheetClose = SheetPrimitive.Close
const SheetPortal = SheetPrimitive.Portal

const sheetEase = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

const SheetOverlay = ({ className, ...props }) => (
  <SheetPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-50 bg-black/45 backdrop-blur-[3px]',
      'transition-opacity duration-300 motion-reduce:duration-150',
      sheetEase,
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
        'fixed z-50 flex flex-col bg-background shadow-2xl shadow-black/10 outline-none',
        'border-border/80 will-change-transform',
        'transition-[transform,opacity,box-shadow] duration-[380ms] motion-reduce:duration-150',
        sheetEase,
        side === 'left' &&
          'inset-y-0 left-0 h-full w-[min(18rem,88vw)] max-w-full border-r',
        side === 'left' &&
          'data-[state=closed]:pointer-events-none data-[state=open]:pointer-events-auto',
        side === 'left' &&
          'data-[state=closed]:-translate-x-[calc(100%+8px)] data-[state=open]:translate-x-0',
        side === 'left' &&
          'data-[state=closed]:opacity-0 data-[state=open]:opacity-100',
        side === 'right' &&
          'inset-y-0 right-0 h-full w-[min(18rem,88vw)] max-w-full border-l',
        side === 'right' &&
          'data-[state=closed]:pointer-events-none data-[state=open]:pointer-events-auto',
        side === 'right' &&
          'data-[state=closed]:translate-x-[calc(100%+8px)] data-[state=open]:translate-x-0',
        side === 'right' &&
          'data-[state=closed]:opacity-0 data-[state=open]:opacity-100',
        className
      )}
      {...props}
    >
      {children}
      <SheetPrimitive.Close
        className={cn(
          'absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground opacity-80',
          'ring-offset-background transition-[background-color,opacity,transform] duration-200',
          sheetEase,
          'hover:scale-105 hover:bg-muted hover:opacity-100 active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 motion-reduce:hover:scale-100 motion-reduce:active:scale-100'
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
