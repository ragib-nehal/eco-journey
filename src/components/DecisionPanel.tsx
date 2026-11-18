import { useEffect, useRef } from 'react'
import { formatMoney, formatTime, signed } from '../game/format.ts'
import { TEST_DEADLINE_MIN } from '../game/initialState.ts'
import { getAvailability, predictedArrival } from '../game/rules.ts'
import type { GameState, Option, Scenario } from '../game/types.ts'
import { PixelSprite } from './PixelSprite.tsx'

interface DecisionPanelProps {
  state: GameState
  scenario: Scenario
  onChoose: (optionId: string) => void
  onPreview: (sprite: string | null) => void
}

/** Known personal costs shown before choosing. C/W/R are learned afterwards. */
function knownCosts(state: GameState, option: Option): { text: string; warn?: boolean }[] {
  const { moneyCents = 0, energy = 0, durationMin = 0 } = option.effects
  const chips: { text: string; warn?: boolean }[] = []
  if (moneyCents) chips.push({ text: `${moneyCents < 0 ? '-' : '+'}${formatMoney(Math.abs(moneyCents))}` })
  if (option.payoutOnCommitCents) chips.push({ text: `+${formatMoney(option.payoutOnCommitCents)} when done` })
  if (energy) chips.push({ text: `${signed(energy)} Energy` })
  if (durationMin) chips.push({ text: `${durationMin} min` })
  const arrival = predictedArrival(state, option)
  if (arrival !== null) {
    const late = arrival > TEST_DEADLINE_MIN
    chips.push({ text: `Arrive ${formatTime(arrival)}${late ? ' (late)' : ''}`, warn: late })
  }
  return chips
}

export function DecisionPanel({ state, scenario, onChoose, onPreview }: DecisionPanelProps) {
  const listRef = useRef<HTMLDivElement>(null)

  // Move keyboard focus to the first available choice for each new decision.
  useEffect(() => {
    listRef.current?.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus({ preventScroll: true })
  }, [scenario.id])

  // Number keys 1–5 pick the matching enabled option.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return
      const index = Number(event.key) - 1
      const option = scenario.options[index]
      if (option && getAvailability(state, option).enabled) {
        event.preventDefault()
        onChoose(option.id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [scenario, state, onChoose])

  return (
    <div className="choices" ref={listRef} role="group" aria-label="Choices" onMouseLeave={() => onPreview(null)}>
      {scenario.options.map((option, index) => {
        const availability = getAvailability(state, option)
        const reasonId = `${option.id}-reason`
        return (
          <button
            key={option.id}
            type="button"
            className="choice px-button"
            disabled={!availability.enabled}
            aria-describedby={availability.enabled ? undefined : reasonId}
            onClick={() => onChoose(option.id)}
            onMouseEnter={() => onPreview(option.sprite)}
            onFocus={() => onPreview(option.sprite)}
          >
            <span className="choice__key" aria-hidden="true">
              {index + 1}
            </span>
            <PixelSprite name={option.sprite} className="choice__icon" />
            <span className="choice__main">
              <span className="choice__label">{option.label}</span>
              <span className="choice__chips">
                {knownCosts(state, option).map((chip) => (
                  <span key={chip.text} className={`chip ${chip.warn ? 'chip--warn' : ''}`}>
                    {chip.warn && <PixelSprite name="warning" scale={1} />}
                    {chip.text}
                  </span>
                ))}
              </span>
              {!availability.enabled && (
                <span className="choice__reason" id={reasonId}>
                  Unavailable: {availability.reason}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
