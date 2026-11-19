// Local high-score table. Scores live only in this browser's localStorage;
// nothing is sent anywhere. Every storage access is guarded, so blocked or
// full storage (private mode, cleared site data) never breaks the game.
import type { DayReport } from './report.ts'

export interface ScoreEntry {
  id: string
  name: string
  dateISO: string
  /** Rounded 0–100 Eco Score, or null when not comparable. */
  ecoScore: number | null
  goalsCompleted: number
  endMoneyCents: number
  carbon: number
  water: number
  waste: number
}

/** The subset of the Web Storage API this module uses. */
export type ScoreStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export const SCORES_KEY = 'eco-journey.highscores.v1'
export const NAME_KEY = 'eco-journey.playerName'
export const MAX_SCORES = 10
export const MAX_NAME_LENGTH = 12
export const DEFAULT_NAME = 'Player'

function browserStorage(): ScoreStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

export function cleanName(name: string): string {
  const trimmed = name.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LENGTH).trim()
  return trimmed || DEFAULT_NAME
}

function isEntry(value: unknown): value is ScoreEntry {
  if (!value || typeof value !== 'object') return false
  const e = value as Record<string, unknown>
  const num = (k: string) => typeof e[k] === 'number' && Number.isFinite(e[k])
  return (
    typeof e.id === 'string' &&
    typeof e.name === 'string' &&
    typeof e.dateISO === 'string' &&
    (e.ecoScore === null || num('ecoScore')) &&
    num('goalsCompleted') &&
    num('endMoneyCents') &&
    num('carbon') &&
    num('water') &&
    num('waste')
  )
}

/** Best first: Eco Score (not comparable last), then goals, then money left, then earliest. */
export function compareScores(a: ScoreEntry, b: ScoreEntry): number {
  const eco = (a.ecoScore ?? -1) - (b.ecoScore ?? -1)
  if (eco !== 0) return -eco
  if (a.goalsCompleted !== b.goalsCompleted) return b.goalsCompleted - a.goalsCompleted
  if (a.endMoneyCents !== b.endMoneyCents) return b.endMoneyCents - a.endMoneyCents
  return a.dateISO.localeCompare(b.dateISO)
}

export function rankScores(list: ScoreEntry[]): ScoreEntry[] {
  return [...list].sort(compareScores)
}

export function loadScores(storage: ScoreStorage | null = browserStorage()): ScoreEntry[] {
  if (!storage) return []
  try {
    const parsed: unknown = JSON.parse(storage.getItem(SCORES_KEY) ?? '[]')
    return Array.isArray(parsed) ? rankScores(parsed.filter(isEntry)).slice(0, MAX_SCORES) : []
  } catch {
    return []
  }
}

function writeScores(list: ScoreEntry[], storage: ScoreStorage | null): void {
  if (!storage) return
  try {
    storage.setItem(SCORES_KEY, JSON.stringify(list))
  } catch {
    // Storage full or blocked: keep playing without saving.
  }
}

export interface AddResult {
  list: ScoreEntry[]
  /** 1-based position in the saved table, or null if it did not make the top 10. */
  rank: number | null
  /** True when this run beats every earlier saved run. */
  isBest: boolean
}

export function addScore(entry: ScoreEntry, storage: ScoreStorage | null = browserStorage()): AddResult {
  const previous = loadScores(storage)
  const list = rankScores([...previous, entry]).slice(0, MAX_SCORES)
  writeScores(list, storage)
  const index = list.findIndex((e) => e.id === entry.id)
  return {
    list,
    rank: index === -1 ? null : index + 1,
    isBest: previous.length > 0 && index === 0,
  }
}

export function renameScore(id: string, name: string, storage: ScoreStorage | null = browserStorage()): ScoreEntry[] {
  const list = loadScores(storage).map((e) => (e.id === id ? { ...e, name: cleanName(name) } : e))
  writeScores(list, storage)
  return list
}

export function clearScores(storage: ScoreStorage | null = browserStorage()): void {
  try {
    storage?.removeItem(SCORES_KEY)
  } catch {
    // Ignore blocked storage.
  }
}

export function loadPlayerName(storage: ScoreStorage | null = browserStorage()): string {
  try {
    const saved = storage?.getItem(NAME_KEY)
    return saved ? cleanName(saved) : ''
  } catch {
    return ''
  }
}

export function savePlayerName(name: string, storage: ScoreStorage | null = browserStorage()): void {
  try {
    storage?.setItem(NAME_KEY, cleanName(name))
  } catch {
    // Ignore blocked storage.
  }
}

export function entryFromReport(report: DayReport, name: string, now: Date = new Date()): ScoreEntry {
  return {
    id: `${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name: cleanName(name),
    dateISO: now.toISOString(),
    ecoScore: report.ecoScore.overall === null ? null : Math.round(report.ecoScore.overall),
    goalsCompleted: report.goalsCompleted,
    endMoneyCents: report.economy.endCents,
    carbon: report.totals.carbon,
    water: report.totals.water,
    waste: report.totals.waste,
  }
}
