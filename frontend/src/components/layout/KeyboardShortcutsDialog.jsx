import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Kbd } from '@/components/ui/Kbd'
import { getAllNavItemsForShortcuts } from '@/config/navigation'
import { useAuth } from '@/hooks/useAuth'
import { isMacLike } from '@/utils/platform'

const KeyboardShortcutsDialog = ({ open, onOpenChange }) => {
  const { isAdmin } = useAuth()
  const items = getAllNavItemsForShortcuts(isAdmin)
  const mod = isMacLike() ? '⌘' : 'Ctrl'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            Press <Kbd className="mx-0.5 align-middle">G</Kbd> then a letter to jump to a section.
            Press <Kbd className="mx-0.5 align-middle">{mod}</Kbd>
            <Kbd className="mx-0.5 align-middle">/</Kbd> anytime to open or close this list.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 border-t border-border/60 pt-4">
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.to}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-sm"
              >
                <span className="font-medium text-foreground">{item.label}</span>
                <span className="flex shrink-0 items-center gap-1">
                  <Kbd>G</Kbd>
                  <span className="text-muted-foreground">+</span>
                  <Kbd>{item.goKey}</Kbd>
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Shortcuts are disabled while typing in inputs, search fields, or text areas.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default KeyboardShortcutsDialog
