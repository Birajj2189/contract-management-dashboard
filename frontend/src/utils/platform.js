/** True for macOS / iOS browsers (⌘ vs Ctrl in shortcut hints). */
export function isMacLike() {
  if (typeof navigator === 'undefined') return false
  return /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent)
}
