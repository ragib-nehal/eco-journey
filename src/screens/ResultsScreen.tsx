import { useEffect, useMemo, useRef } from 'react'
import { PixelStage } from '../components/PixelStage.tsx'
import { PixelSprite } from '../components/PixelSprite.tsx'
import { METRICS, type Metric } from '../game/ecoScore.ts'
import { formatMoney } from '../game/format.ts'
import { GOALS } from '../game/initialState.ts'
import { buildReport } from '../game/report.ts'
import type { GameState } from '../game/types.ts'
import { energyAtPractice, goalExplanation, STATUS_LABEL, STATUS_SPRITE } from '../ui/goalText.ts'

interface ResultsScreenProps {
  state: GameState
  onRestart: () => void
}

const METRIC_INFO: Record<Metric, { label: string; sprite: string }> = {
  carbon: { label: 'Carbon', sprite: 'carbon' },
  water: { label: 'Water', sprite: 'water' },
  waste: { label: 'Waste', sprite: 'trash' },
}

export function ResultsScreen({ state, onRestart }: ResultsScreenProps) {
  const report = useMemo(() => buildReport(state), [state])
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    headingRef.current?.focus()
  }, [])
  const { ecoScore, economy } = report

  return (
    <main className="results">
      <div className="results__hero">
        <PixelStage scene="evening" sprite="notebook" ambience="sparkle" label="Home at night, the day is done" />
        <h1 className="results__title" ref={headingRef} tabIndex={-1}>
          <span>10:00 PM</span>
          <small>Day complete</small>
        </h1>
      </div>

      <section className="px-panel" aria-labelledby="r-goals">
        <h2 id="r-goals" className="panel-title">
          Personal goals: {report.goalsCompleted} of 3 completed
        </h2>
        <ul className="result-goals">
          {report.goals.map(({ id, status }) => (
            <li key={id} className={`result-goal goal--${status.toLowerCase()}`}>
              <PixelSprite name={GOALS[id].sprite} scale={3} />
              <div>
                <strong>{GOALS[id].title}</strong>
                <span className="badge">
                  <PixelSprite name={STATUS_SPRITE[status]} scale={1} />
                  {STATUS_LABEL[status]}
                </span>
                <p>{goalExplanation(id, state, energyAtPractice(state))}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-panel" aria-labelledby="r-env">
        <h2 id="r-env" className="panel-title">Environmental impact</h2>
        <div className="totals">
          {METRICS.map((metric) => {
            const score = ecoScore.metrics[metric]
            const { min, max } = ecoScore.bounds[metric]
            return (
              <div key={metric} className="total">
                <PixelSprite name={METRIC_INFO[metric].sprite} scale={3} />
                <div className="total__value">
                  {report.totals[metric]} <span>pts</span>
                </div>
                <div className="total__label">{METRIC_INFO[metric].label}</div>
                <div className="total__range">
                  Possible today: {min}–{max}
                </div>
                {score === null ? (
                  <div className="total__score">Not comparable</div>
                ) : (
                  <div className="total__score">
                    <span className="meter meter--wide" aria-hidden="true">
                      <span className="meter__fill meter__fill--blue" style={{ width: `${score}%` }} />
                    </span>
                    Score {Math.round(score)}/100
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="eco-score">
          <PixelSprite name="recycle" scale={3} />
          <div>
            <div className="eco-score__value">
              Eco Score: {ecoScore.overall === null ? 'not comparable' : `${Math.round(ecoScore.overall)}/100`}
            </div>
            <p className="note">
              A relative game score comparing your totals with the lowest and highest totals possible in this game
              (higher = lower modeled impact). It is not a certified measure of sustainability, and it does not
              include your personal goals.
            </p>
          </div>
        </div>
      </section>

      <div className="results__grid">
        <section className="px-panel" aria-labelledby="r-high">
          <h2 id="r-high" className="panel-title">Decision highlights</h2>
          <h3 className="sub-title">Biggest contributors</h3>
          {report.contributors.length ? (
            <ul className="highlights">
              {report.contributors.map((h) => (
                <li key={h.record.optionId}>
                  <strong>{h.label}</strong> <span className="muted">({h.title})</span>: +{h.record.impact} pts
                </li>
              ))}
            </ul>
          ) : (
            <p>None of your choices added impact points.</p>
          )}
          <h3 className="sub-title">Helpful trade-offs</h3>
          {report.tradeOffs.length ? (
            <ul className="highlights">
              {report.tradeOffs.map((h) => (
                <li key={h.record.optionId}>
                  <strong>{h.label}</strong> <span className="muted">({h.title})</span>: the lowest-impact option you
                  had, versus up to +{h.record.highestEnabledImpact} pts
                </li>
              ))}
            </ul>
          ) : (
            <p>No lowest-impact picks this time. Try a different strategy on your next run.</p>
          )}
        </section>

        <section className="px-panel" aria-labelledby="r-econ">
          <h2 id="r-econ" className="panel-title">Money and energy</h2>
          <dl className="econ">
            <dt>Money</dt>
            <dd>
              {formatMoney(economy.startCents)} → <strong>{formatMoney(economy.endCents)}</strong>
            </dd>
            <dt>Chore income</dt>
            <dd>{formatMoney(economy.choreIncomeCents)}</dd>
            <dt>Energy</dt>
            <dd>
              {economy.startEnergy} → <strong>{economy.endEnergy}</strong>
            </dd>
          </dl>
          {economy.spending.length > 0 && (
            <>
              <h3 className="sub-title">Spending</h3>
              <ul className="highlights">
                {economy.spending.map((s, i) => (
                  <li key={`${s.label}-${i}`}>
                    {s.label}: {formatMoney(s.cents)}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>

      <section className="px-panel reflection" aria-labelledby="r-reflect">
        <h2 id="r-reflect" className="panel-title">Reflection</h2>
        <p>
          Personal goals and environmental impact are separate stories: meeting every goal does not make a day
          sustainable, and a low-impact day does not guarantee your goals. Which trade-offs felt worth it? Try another
          run with a different strategy and compare.
        </p>
        <p className="note">
          All impact values are simplified game points awaiting source review, not real-world measurements.
        </p>
        <button type="button" className="px-button px-button--primary" onClick={onRestart}>
          Play again <span aria-hidden="true">↻</span>
        </button>
      </section>
    </main>
  )
}
