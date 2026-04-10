import { useState, useEffect } from 'react'

/**
 * True when viewport width is at least `minPx` (matches `(min-width: Npx)`).
 */
export function useMinWidth(minPx) {
  const query = `(min-width: ${minPx}px)`

  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  )

  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])

  return matches
}
