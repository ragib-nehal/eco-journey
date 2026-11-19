import { describe, expect, it } from 'vitest'
import {
  addScore,
  cleanName,
  clearScores,
  entryFromReport,
  loadPlayerName,
  loadScores,
  MAX_SCORES,
  rankScores,
  renameScore,
  savePlayerName,
  SCORES_KEY,
  type ScoreEntry,
  type ScoreStorage,
} from '../game/highScores.ts'
import { createInitialState } from '../game/initialState.ts'
import { buildReport } from '../game/report.ts'

function memoryStorage(): ScoreStorage & { data: Map<string, string> } {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  }
}

const throwingStorage: ScoreStorage = {
  getItem: () => {
    throw new Error('blocked')
  },
  setItem: () => {
    throw new Error('blocked')
  },
  removeItem: () => {
    throw new Error('blocked')
  },
}

let counter = 0
function entry(overrides: Partial<ScoreEntry> = {}): ScoreEntry {
  counter += 1
  return {
    id: `e${counter}`,
    name: 'Player',
    dateISO: new Date(Date.UTC(2026, 0, 1, 0, counter)).toISOString(),
    ecoScore: 50,
    goalsCompleted: 2,
    endMoneyCents: 1000,
    carbon: 10,
    water: 5,
    waste: 3,
    ...overrides,
  }
}

describe('high scores', () => {
  it('ranks by eco score, then goals, then money, then earliest', () => {
    const a = entry({ ecoScore: 80 })
    const b = entry({ ecoScore: 90 })
    const c = entry({ ecoScore: 80, goalsCompleted: 3 })
    const d = entry({ ecoScore: 80, endMoneyCents: 2000 })
    const e = entry({ ecoScore: null, goalsCompleted: 3 })
    const f = entry({ ecoScore: 80 }) // ties with a, but later
    expect(rankScores([e, f, a, d, c, b]).map((x) => x.id)).toEqual([b.id, c.id, d.id, a.id, f.id, e.id])
  })

  it('saves, reports rank, and flags a new best', () => {
    const storage = memoryStorage()
    const first = addScore(entry({ ecoScore: 40 }), storage)
    expect(first.rank).toBe(1)
    expect(first.isBest).toBe(false) // nothing to beat yet

    const worse = addScore(entry({ ecoScore: 30 }), storage)
    expect(worse.rank).toBe(2)
    expect(worse.isBest).toBe(false)

    const better = addScore(entry({ ecoScore: 70 }), storage)
    expect(better.rank).toBe(1)
    expect(better.isBest).toBe(true)
    expect(loadScores(storage)).toHaveLength(3)
  })

  it(`keeps only the top ${MAX_SCORES}`, () => {
    const storage = memoryStorage()
    for (let i = 0; i < MAX_SCORES; i++) addScore(entry({ ecoScore: 50 + i }), storage)
    const low = addScore(entry({ ecoScore: 10 }), storage)
    expect(low.rank).toBeNull()
    expect(low.list).toHaveLength(MAX_SCORES)
    expect(loadScores(storage).every((e) => (e.ecoScore ?? 0) >= 50)).toBe(true)
  })

  it('ignores corrupt or malformed saved data', () => {
    const storage = memoryStorage()
    storage.setItem(SCORES_KEY, '{not json')
    expect(loadScores(storage)).toEqual([])
    storage.setItem(SCORES_KEY, JSON.stringify([entry(), { id: 'bad' }, 42]))
    expect(loadScores(storage)).toHaveLength(1)
  })

  it('never throws when storage is blocked or missing', () => {
    expect(loadScores(throwingStorage)).toEqual([])
    expect(addScore(entry(), throwingStorage).rank).toBe(1)
    expect(() => clearScores(throwingStorage)).not.toThrow()
    expect(loadPlayerName(throwingStorage)).toBe('')
    expect(() => savePlayerName('Sam', throwingStorage)).not.toThrow()
    expect(loadScores(null)).toEqual([])
  })

  it('cleans names and falls back to Player', () => {
    expect(cleanName('   ')).toBe('Player')
    expect(cleanName('  Sam  ')).toBe('Sam')
    expect(cleanName('Supercalifragilistic')).toBe('Supercalifra')
    // A space left at the cut point is trimmed too.
    expect(cleanName('A very long player name')).toBe('A very long')
  })

  it('renames an entry and remembers the player name', () => {
    const storage = memoryStorage()
    const e = entry()
    addScore(e, storage)
    renameScore(e.id, ' Riya ', storage)
    expect(loadScores(storage)[0].name).toBe('Riya')
    savePlayerName('Riya', storage)
    expect(loadPlayerName(storage)).toBe('Riya')
    clearScores(storage)
    expect(loadScores(storage)).toEqual([])
  })

  it('builds an entry from the day report', () => {
    const report = buildReport(createInitialState())
    const e = entryFromReport(report, '', new Date('2026-11-18T12:00:00Z'))
    expect(e.name).toBe('Player')
    expect(e.dateISO).toBe('2026-11-18T12:00:00.000Z')
    expect(e.goalsCompleted).toBe(report.goalsCompleted)
    expect(e.endMoneyCents).toBe(report.economy.endCents)
  })
})
