import { formatMoney, formatTime } from '../game/format.ts'
import type { GameState } from '../game/types.ts'
import { PixelSprite } from './PixelSprite.tsx'

interface StatusBarProps {
  state: GameState
}

/** Shows the change from the latest decision as a short floating popup. */
function Popup({ value, format = String }: { value: number; format?: (n: number) => string }) {
  if (value === 0) return null
  return (
    <span className={`popup ${value > 0 ? 'popup--up' : 'popup--down'}`} aria-hidden="true">
      {value > 0 ? '+' : '-'}
      {format(Math.abs(value))}
    </span>
  )
}

export function StatusBar({ state }: StatusBarProps) {
  const last = state.phase === 'feedback' ? state.history.at(-1) : undefined
  const delta = (key: 'moneyCents' | 'energy' | 'carbon' | 'water' | 'waste') =>
    last ? last.after[key] - last.before[key] : 0
  const popupKey = state.history.length

  return (
    <header className="hud px-panel px-panel--dark" aria-label="Status">
      <div className="hud__group">
        <div className="hud__stat" title="Simulated time">
          <PixelSprite name="clock" />
          <span className="hud__label">Time</span>
          <strong className="hud__value hud__value--time">{formatTime(state.timeMin)}</strong>
        </div>
        <div className="hud__stat" title="Money">
          <PixelSprite name="coins" />
          <span className="hud__label">Money</span>
          <strong className="hud__value hud__value--money">{formatMoney(state.moneyCents)}</strong>
          <Popup key={`m${popupKey}`} value={delta('moneyCents')} format={formatMoney} />
        </div>
        <div className="hud__stat hud__stat--energy" title="Energy (0–100)">
          <PixelSprite name="battery" />
          <span className="hud__label">Energy</span>
          <span
            className="meter"
            role="meter"
            aria-label="Energy"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={state.energy}
          >
            <span className="meter__fill" style={{ width: `${state.energy}%` }} />
          </span>
          <strong className="hud__value">{state.energy}</strong>
          <Popup key={`e${popupKey}`} value={delta('energy')} />
        </div>
      </div>
      <div className="hud__group hud__group--impact" aria-label="Environmental impact points (game values, lower is lower modeled impact)">
        {(
          [
            ['carbon', 'carbon', 'Carbon'],
            ['water', 'water', 'Water'],
            ['waste', 'trash', 'Waste'],
          ] as const
        ).map(([key, sprite, label]) => (
          <div className="hud__stat hud__stat--impact" key={key} title={`${label} impact points (game points, not a measurement)`}>
            <PixelSprite name={sprite} />
            <span className="hud__label">{label}</span>
            <strong className="hud__value">{state[key]}</strong>
            <Popup key={`${key}${popupKey}`} value={delta(key)} />
          </div>
        ))}
      </div>
    </header>
  )
}
