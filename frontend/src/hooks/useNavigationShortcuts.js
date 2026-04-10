import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { buildGoKeyMap } from '@/config/navigation'
import { useMinWidth } from '@/hooks/useBreakpoint'

const GO_PREFIX_TIMEOUT_MS = 1200
const LG = 1024

function isFormField(el) {
  if (!el || !el.tagName) return false
  const tag = el.tagName.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true
  if (el.isContentEditable) return true
  if (el.getAttribute?.('role') === 'combobox') return true
  return false
}

/** Block go-sequences when focus is inside modals / popovers (not plain dialog backdrop). */
function shouldBlockGoShortcut(el) {
  if (isFormField(el)) return true
  if (el.closest?.('[role="dialog"]')) return true
  if (el.closest?.('[data-radix-popper-content-wrapper]')) return true
  return false
}

/**
 * Desktop (lg+): `G` then letter navigates; Ctrl+/ or ⌘+/ toggles shortcut help.
 */
export function useNavigationShortcuts() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const isLargeScreen = useMinWidth(LG)
  const [helpOpen, setHelpOpen] = useState(false)
  const helpOpenRef = useRef(helpOpen)
  helpOpenRef.current = helpOpen

  const goPendingRef = useRef(false)
  const timerRef = useRef(null)
  const keyMapRef = useRef(buildGoKeyMap(isAdmin))

  useEffect(() => {
    keyMapRef.current = buildGoKeyMap(isAdmin)
  }, [isAdmin])

  const clearGoPending = useCallback(() => {
    goPendingRef.current = false
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!isLargeScreen) return undefined

    const onKeyDown = (e) => {
      const helpShortcut =
        (e.ctrlKey || e.metaKey) && !e.altKey && e.code === 'Slash'
      if (helpShortcut) {
        if (isFormField(e.target)) return
        e.preventDefault()
        setHelpOpen((o) => !o)
        clearGoPending()
        return
      }

      if (helpOpenRef.current) return

      if (shouldBlockGoShortcut(e.target)) return

      const lower = e.key.length === 1 ? e.key.toLowerCase() : ''

      if (lower === 'g') {
        e.preventDefault()
        goPendingRef.current = true
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
          goPendingRef.current = false
          timerRef.current = null
        }, GO_PREFIX_TIMEOUT_MS)
        return
      }

      if (goPendingRef.current && lower && lower.length === 1) {
        e.preventDefault()
        clearGoPending()
        const entry = keyMapRef.current[lower]
        if (entry) navigate(entry.to)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isLargeScreen, navigate, clearGoPending])

  return { helpOpen, setHelpOpen }
}
