import { useEffect, useRef } from 'react'
import { PixelStage } from '../components/PixelStage.tsx'
import { PixelSprite } from '../components/PixelSprite.tsx'
import { GOALS, GOAL_ORDER } from '../game/initialState.ts'

interface StartScreenProps {
  onStart: () => void
}

const RESOURCES = [
  { sprite: 'coins', name: 'Money', text: 'You start with $25. Purchases need enough money; you can never go below $0.' },
  { sprite: 'battery', name: 'Energy', text: 'Starts at 70 (range 0–100). Some choices give or use energy.' },
  { sprite: 'clock', name: 'Time', text: 'The day runs from 7:00 AM to 10:00 PM. Take as long as you like to read.' },
  { sprite: 'carbon', name: 'Carbon', text: 'Climate impact from energy, transport, food, and products.' },
  { sprite: 'water', name: 'Water', text: 'Water used by showers, taps, and washing.' },
  { sprite: 'trash', name: 'Waste', text: 'Single-use items, new materials, and disposal mistakes.' },
]

export function StartScreen({ onStart }: StartScreenProps) {
  const startRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    startRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <main className="start">
      <div className="start__hero">
        <PixelStage scene="morning" sprite="alarm" ambience="sparkle" label="A cozy bedroom at sunrise" />
        <h1 className="start__title">
          <span>Eco Choices</span>
          <small>A Day in Your Life</small>
        </h1>
      </div>

      <section className="px-panel start__intro">
        <p>
          Play through one ordinary school day. Meet your goals, manage your money, energy, and time, and see how
          everyday choices add up. There is no single perfect answer: real life has trade-offs.
        </p>
        <button ref={startRef} type="button" className="px-button px-button--primary start__button" onClick={onStart}>
          Start the day <span aria-hidden="true">▶</span>
        </button>
        <p className="note">Mouse, touch, or keyboard: Tab to move, 1–5 to choose, Enter to continue.</p>
      </section>

      <div className="start__grid">
        <section className="px-panel" aria-labelledby="start-goals">
          <h2 id="start-goals" className="panel-title">Your three goals</h2>
          <ul className="legend">
            {GOAL_ORDER.map((id) => (
              <li key={id}>
                <PixelSprite name={GOALS[id].sprite} />
                <span>
                  <strong>{GOALS[id].title}</strong> &mdash; {GOALS[id].requirement}
                </span>
              </li>
            ))}
          </ul>
          <p className="note">Missing a goal never ends the day. You always reach the evening recap.</p>
        </section>

        <section className="px-panel" aria-labelledby="start-resources">
          <h2 id="start-resources" className="panel-title">What you track</h2>
          <ul className="legend">
            {RESOURCES.map((r) => (
              <li key={r.name}>
                <PixelSprite name={r.sprite} />
                <span>
                  <strong>{r.name}</strong> &mdash; {r.text}
                </span>
              </li>
            ))}
          </ul>
          <p className="note">
            Carbon, Water, and Waste are simplified <strong>game impact points</strong>, not kilograms or liters. Lower
            means lower modeled impact. They never cost money or block choices.
          </p>
        </section>
      </div>
    </main>
  )
}
