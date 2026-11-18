// Relative Eco Score (GDD Revision 1.1).
//
// Bounds are the minimum and maximum achievable C, W and R totals across all
// complete, valid one-day paths, honoring affordability, energy, and
// prerequisites. They are found with a memoized depth-first search over the
// decision tree, not by summing each event's best and worst option.
import { createInitialState } from './initialState.ts'
import { applyOption, getAvailability } from './rules.ts'
import { SCENARIOS } from './scenarios.ts'
import type { GameState } from './types.ts'

export type Metric = 'carbon' | 'water' | 'waste'
export const METRICS: Metric[] = ['carbon', 'water', 'waste']

export interface Range {
  min: number
  max: number
}
export type Bounds = Record<Metric, Range>

function stateKey(state: GameState): string {
  return `${state.queue.join(',')}|${state.moneyCents}|${state.energy}|${[...state.flags].sort().join(',')}`
}

/** Remaining achievable impact from `state` to the end of the day. */
function explore(state: GameState, memo: Map<string, Bounds>): Bounds {
  const id = state.queue[0]
  if (!id) return { carbon: { min: 0, max: 0 }, water: { min: 0, max: 0 }, waste: { min: 0, max: 0 } }
  const key = stateKey(state)
  const cached = memo.get(key)
  if (cached) return cached

  const scenario = SCENARIOS[id]
  const enabled = scenario.options.filter((option) => getAvailability(state, option).enabled)
  if (enabled.length === 0) {
    throw new Error(`Dead end: no enabled option for "${id}" (money ${state.moneyCents}, energy ${state.energy})`)
  }
  const result: Bounds = {
    carbon: { min: Infinity, max: -Infinity },
    water: { min: Infinity, max: -Infinity },
    waste: { min: Infinity, max: -Infinity },
  }
  for (const option of enabled) {
    const rest = explore(applyOption(state, scenario, option), memo)
    for (const metric of METRICS) {
      const delta = option.effects[metric] ?? 0
      result[metric].min = Math.min(result[metric].min, delta + rest[metric].min)
      result[metric].max = Math.max(result[metric].max, delta + rest[metric].max)
    }
  }
  memo.set(key, result)
  return result
}

let cachedBounds: Bounds | null = null

/** Achievable bounds for a full day from the initial state. */
export function computeBounds(): Bounds {
  cachedBounds ??= explore(createInitialState(), new Map())
  return cachedBounds
}

/** 0–100, higher is better; null when the metric has no variation. */
export function metricScore(value: number, range: Range): number | null {
  if (range.max === range.min) return null
  const score = (100 * (range.max - value)) / (range.max - range.min)
  return Math.min(100, Math.max(0, score))
}

export interface EcoScore {
  /** Mean of comparable metric scores (unrounded), or null if none. */
  overall: number | null
  metrics: Record<Metric, number | null>
  bounds: Bounds
}

export function computeEcoScore(totals: Record<Metric, number>, bounds: Bounds = computeBounds()): EcoScore {
  const metrics = {
    carbon: metricScore(totals.carbon, bounds.carbon),
    water: metricScore(totals.water, bounds.water),
    waste: metricScore(totals.waste, bounds.waste),
  }
  const comparable = METRICS.map((m) => metrics[m]).filter((score): score is number => score !== null)
  const overall = comparable.length ? comparable.reduce((a, b) => a + b, 0) / comparable.length : null
  return { overall, metrics, bounds }
}
