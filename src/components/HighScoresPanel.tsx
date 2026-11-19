import { useEffect, useRef, useState } from 'react'
import { formatMoney } from '../game/format.ts'
import {
  addScore,
  type AddResult,
  clearScores,
  DEFAULT_NAME,
  entryFromReport,
  loadPlayerName,
  MAX_NAME_LENGTH,
  MAX_SCORES,
  renameScore,
  savePlayerName,
} from '../game/highScores.ts'
import type { DayReport } from '../game/report.ts'
import { PixelSprite } from './PixelSprite.tsx'

interface HighScoresPanelProps {
  report: DayReport
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

/** Saves this run once, then shows the local top-10 table. */
export function HighScoresPanel({ report }: HighScoresPanelProps) {
  const [name, setName] = useState(loadPlayerName)
  const [result, setResult] = useState<AddResult | null>(null)
  const savedId = useRef<string | null>(null)

  useEffect(() => {
    // The ref survives StrictMode's double effect run, so the run is saved once.
    if (savedId.current) return
    const entry = entryFromReport(report, loadPlayerName())
    savedId.current = entry.id
    setResult(addScore(entry))
  }, [report])

  const commitName = () => {
    if (!savedId.current || !result) return
    savePlayerName(name)
    setResult({ ...result, list: renameScore(savedId.current, name) })
  }

  const clearAll = () => {
    if (!window.confirm('Clear all saved scores on this device?')) return
    clearScores()
    setResult({ list: [], rank: null, isBest: false })
  }

  return (
    <section className="px-panel scores" aria-labelledby="r-scores">
      <h2 id="r-scores" className="panel-title">
        Your best days
      </h2>

      {result?.isBest && (
        <p className="badge scores__best" role="status">
          <PixelSprite name="check" scale={1} /> New best Eco Score!
        </p>
      )}

      <form
        className="scores__name"
        onSubmit={(event) => {
          event.preventDefault()
          commitName()
        }}
      >
        <label htmlFor="player-name">Your name</label>
        <input
          id="player-name"
          type="text"
          value={name}
          maxLength={MAX_NAME_LENGTH}
          placeholder={DEFAULT_NAME}
          autoComplete="nickname"
          onChange={(event) => setName(event.target.value)}
          onBlur={commitName}
        />
        <button type="submit" className="px-button">
          Save name
        </button>
      </form>

      {result && result.list.length > 0 ? (
        <ol className="scores__list">
          {result.list.map((e, i) => (
            <li key={e.id} className={e.id === savedId.current ? 'scores__row scores__row--current' : 'scores__row'}>
              <span className="scores__rank">{i + 1}</span>
              <span className="scores__who">
                {e.name}
                {e.id === savedId.current && <span className="muted"> (this run)</span>}
              </span>
              <span className="scores__eco">{e.ecoScore === null ? '—' : e.ecoScore}</span>
              <span className="scores__meta">
                {e.goalsCompleted}/3 goals · {formatMoney(e.endMoneyCents)} · {formatDate(e.dateISO)}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        result && <p>No saved scores yet.</p>
      )}

      <div className="scores__footer">
        <div>
          {result && result.rank === null && result.list.length > 0 && (
            <p className="note">This run did not make your top {MAX_SCORES}. Try a new strategy!</p>
          )}
          <p className="note">
            Ranked by Eco Score, then goals completed, then money left. Scores are saved only in this browser.
          </p>
        </div>
        {result && result.list.length > 0 && (
          <button type="button" className="px-button scores__clear" onClick={clearAll}>
            Clear scores
          </button>
        )}
      </div>
    </section>
  )
}
