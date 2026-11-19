import { useTypewriter } from '../ui/useTypewriter.ts'

interface TypewriterProps {
  text: string
}

/**
 * A dialogue line that types itself out. Click it to show the whole line.
 * The untyped remainder is kept in place (invisible) so the box does not
 * resize while typing, and screen readers get the full line straight away.
 */
export function Typewriter({ text }: TypewriterProps) {
  const { shown, hidden, done, skip } = useTypewriter(text)
  return (
    <p className={done ? 'typewriter' : 'typewriter typewriter--typing'} onClick={done ? undefined : skip}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{shown}</span>
      {hidden && (
        <span aria-hidden="true" className="typewriter__ghost">
          {hidden}
        </span>
      )}
    </p>
  )
}
