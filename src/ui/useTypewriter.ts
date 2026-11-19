import { useCallback, useEffect, useState } from 'react'
import { prefersReducedMotion } from './motion.ts'

/** Characters revealed per second. */
const DEFAULT_CPS = 45

const startCount = (text: string) => (prefersReducedMotion() ? text.length : 0)

/**
 * Reveals `text` one character at a time. Restarts whenever `text` changes and
 * shows everything at once when reduced motion is on or `skip` is called.
 */
export function useTypewriter(text: string, cps = DEFAULT_CPS) {
  const [state, setState] = useState(() => ({ text, count: startCount(text) }))

  // Reset during render when the text changes, so the old line never flashes.
  let current = state
  if (state.text !== text) {
    current = { text, count: startCount(text) }
    setState(current)
  }

  const done = current.count >= text.length

  useEffect(() => {
    if (done) return
    const id = window.setInterval(() => {
      setState((s) => (s.text !== text || s.count >= text.length ? s : { text, count: s.count + 1 }))
    }, 1000 / cps)
    return () => window.clearInterval(id)
  }, [text, cps, done])

  const skip = useCallback(() => setState({ text, count: text.length }), [text])

  return { shown: text.slice(0, current.count), hidden: text.slice(current.count), done, skip }
}
