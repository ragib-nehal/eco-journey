import { useEffect, useRef } from 'react'
import { formatMoney, formatTime, signed } from '../game/format.ts'
import type { DecisionRecord, Option } from '../game/types.ts'
import { PixelSprite } from './PixelSprite.tsx'

interface FeedbackPanelProps {
  option: Option
  record: DecisionRecord
  onContinue: () => void
}

export function ContinueButton({ onContinue, label = 'Continue' }: { onContinue: () => void; label?: string }) {
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    ref.current?.focus({ preventScroll: true })
  }, [])
  return (
    <button ref={ref} type="button" className="px-button px-button--primary continue" onClick={onContinue}>
      {label} <span aria-hidden="true">▶</span>
    </button>
  )
}

export function FeedbackPanel({ option, record, onContinue }: FeedbackPanelProps) {
  const d = (key: keyof DecisionRecord['after']) => record.after[key] - record.before[key]
  const changes: { sprite: string; text: string }[] = []
  const money = d('moneyCents')
  if (money) changes.push({ sprite: 'coins', text: `Money ${money > 0 ? '+' : '-'}${formatMoney(Math.abs(money))}` })
  if (d('energy')) changes.push({ sprite: 'battery', text: `Energy ${signed(d('energy'))}` })
  if (record.durationMin) changes.push({ sprite: 'clock', text: `Took ${record.durationMin} min` })
  if (record.arrivalMin !== undefined) changes.push({ sprite: 'clock', text: `Arrival ${formatTime(record.arrivalMin)}` })
  if (d('carbon')) changes.push({ sprite: 'carbon', text: `Carbon ${signed(d('carbon'))} pts` })
  if (d('water')) changes.push({ sprite: 'water', text: `Water ${signed(d('water'))} pts` })
  if (d('waste')) changes.push({ sprite: 'trash', text: `Waste ${signed(d('waste'))} pts` })
  if (changes.length === 0) changes.push({ sprite: 'check', text: 'No modeled changes' })

  return (
    <div className="feedback" aria-live="polite">
      <p className="feedback__choice">
        <PixelSprite name={option.sprite} /> You chose: <strong>{option.label}</strong>
      </p>
      {/* The outcome is shown in the dialogue box; repeat it here for screen readers. */}
      <p className="sr-only">{option.feedback.outcome}</p>
      <ul className="feedback__changes" aria-label="What changed">
        {changes.map((change) => (
          <li key={change.text} className="chip chip--big">
            <PixelSprite name={change.sprite} scale={1} />
            {change.text}
          </li>
        ))}
      </ul>
      <p className="feedback__why">
        <strong>Why it matters:</strong> {option.feedback.why}
      </p>
      <p className="note">
        Points are simplified game values, not measurements. Explanations are pending source review.
        {option.unmodeled && ` Not yet modeled: ${option.unmodeled}`}
      </p>
      <ContinueButton onContinue={onContinue} />
    </div>
  )
}
