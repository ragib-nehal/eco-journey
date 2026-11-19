import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { HighScoresPanel } from '../components/HighScoresPanel.tsx'
import { PixelSprite } from '../components/PixelSprite.tsx'
import { METRICS, type Metric } from '../game/ecoScore.ts'
import { sourcesFor } from '../game/evidence.ts'
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

const TABS = [
  { id: 'summary', label: 'Summary' },
  { id: 'highlights', label: 'Highlights' },
  { id: 'scores', label: 'High scores' },
] as const
type TabId = (typeof TABS)[number]['id']

export function ResultsScreen({ state, onRestart }: ResultsScreenProps) {
  const report = useMemo(() => buildReport(state), [state])
  const headingRef = useRef<HTMLHeadingElement>(null)
  const tabRefs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({})
  const [tab, setTab] = useState<TabId>('summary')
  useEffect(() => {
    headingRef.current?.focus()
  }, [])
  const { ecoScore, economy } = report
  const sources = useMemo(() => sourcesFor(state.history.map((r) => r.optionId)), [state.history])

  // Arrow keys, Home, and End move between tabs (WAI-ARIA tabs pattern).
  const onTabKey = (event: KeyboardEvent) => {
    const index = TABS.findIndex((t) => t.id === tab)
    const next =
      event.key === 'ArrowRight' ? (index + 1) % TABS.length
      : event.key === 'ArrowLeft' ? (index - 1 + TABS.length) % TABS.length
      : event.key === 'Home' ? 0
      : event.key === 'End' ? TABS.length - 1
      : null
    if (next === null) return
    event.preventDefault()
    setTab(TABS[next].id)
    tabRefs.current[TABS[next].id]?.focus()
  }

  // Every tab panel stays mounted and inactive ones are hidden. The high-score
  // panel saves this run when it mounts, so it must mount exactly once.
  const panelProps = (id: TabId) => ({
    role: 'tabpanel',
    id: `r-panel-${id}`,
    'aria-labelledby': `r-tab-${id}`,
    hidden: tab !== id,
    className: `results__panel results__panel--${id}`,
  })

  return (
    <main className="results">
      <header className="results__bar px-panel px-panel--dark">
        <PixelSprite name="notebook" scale={2} />
        <h1 className="results__title" ref={headingRef} tabIndex={-1}>
          <span>10:00 PM</span>
          <small>Day complete</small>
        </h1>
        <dl className="results__stats">
          <div>
            <dt>Eco Score</dt>
            <dd>{ecoScore.overall === null ? '—' : `${Math.round(ecoScore.overall)}/100`}</dd>
          </div>
          <div>
            <dt>Goals</dt>
            <dd>{report.goalsCompleted}/3</dd>
          </div>
          <div>
            <dt>Money left</dt>
            <dd>{formatMoney(economy.endCents)}</dd>
          </div>
        </dl>
        <button type="button" className="px-button px-button--primary results__again" onClick={onRestart}>
          Play again <span aria-hidden="true">↻</span>
        </button>
      </header>

      <div className="results__tabs" role="tablist" aria-label="Day recap" onKeyDown={onTabKey}>
        {TABS.map((t) => (
          <button
            key={t.id}
            ref={(el) => {
              tabRefs.current[t.id] = el
            }}
            type="button"
            role="tab"
            id={`r-tab-${t.id}`}
            className="px-button results__tab"
            aria-selected={tab === t.id}
            aria-controls={`r-panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div {...panelProps('summary')}>
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
      </div>

      <div {...panelProps('highlights')}>
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

        {sources.length > 0 && (
          <section className="px-panel" aria-labelledby="r-sources">
            <h2 id="r-sources" className="panel-title">Sources for today&apos;s facts</h2>
            <ul className="sources">
              {sources.map((s) => (
                <li key={s.id}>
                  {s.publisher}, <cite>{s.title}</cite> ({s.year}).{' '}
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.url}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="px-panel reflection" aria-labelledby="r-reflect">
          <h2 id="r-reflect" className="panel-title">Reflection</h2>
          <p>
            Personal goals and environmental impact are separate stories: meeting every goal does not make a day
            sustainable, and a low-impact day does not guarantee your goals. Which trade-offs felt worth it? Try another
            run with a different strategy and compare.
          </p>
          <p className="note">
            Impact values are simplified game points, not real-world measurements.
          </p>
        </section>
      </div>

      <div {...panelProps('scores')}>
        <HighScoresPanel report={report} />
      </div>
    </main>
  )
}
