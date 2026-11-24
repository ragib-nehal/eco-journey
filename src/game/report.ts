// End-of-day report: totals, highlights, economy, and goal outcomes.
import { computeEcoScore, type EcoScore } from './ecoScore.ts'
import { GOAL_ORDER, START_ENERGY, START_MONEY_CENTS } from './initialState.ts'
import { getOption, SCENARIOS } from './scenarios.ts'
import type { DecisionRecord, GameState, GoalId, GoalStatus } from './types.ts'

export interface Highlight {
  record: DecisionRecord
  title: string
  label: string
}

export interface Spend {
  label: string
  cents: number
}

export interface DayReport {
  totals: { carbon: number; water: number; waste: number }
  ecoScore: EcoScore
  goals: { id: GoalId; status: GoalStatus }[]
  goalsCompleted: number
  /** The 2–3 choices that added the most impact points. */
  contributors: Highlight[]
  /** Up to 2 choices where the player took the lowest-impact option available. */
  tradeOffs: Highlight[]
  /** Up to 5 highest-impact choices where a lower-impact option was available. */
  keepInMind: Highlight[]
  economy: {
    startCents: number
    endCents: number
    choreIncomeCents: number
    spending: Spend[]
    startEnergy: number
    endEnergy: number
  }
}

export type ImpactTier = 'low' | 'medium' | 'high'

/**
 * How a choice compares with the other options enabled at the time. Null when
 * every enabled option had the same impact, so no comparison applies.
 */
export function impactTier(record: DecisionRecord): ImpactTier | null {
  if (record.lowestImpact && record.impact === record.highestEnabledImpact) return null
  if (record.lowestImpact) return 'low'
  if (record.impact === record.highestEnabledImpact) return 'high'
  return 'medium'
}

function toHighlight(record: DecisionRecord): Highlight {
  return {
    record,
    title: SCENARIOS[record.scenarioId].title,
    label: getOption(record.scenarioId, record.optionId)?.label ?? record.optionId,
  }
}

export function buildReport(state: GameState): DayReport {
  const totals = { carbon: state.carbon, water: state.water, waste: state.waste }

  const contributors = state.history
    .filter((r) => r.impact > 0)
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 3)
    .map(toHighlight)

  const tradeOffs = state.history
    .filter((r) => r.lowestImpact && r.highestEnabledImpact > r.impact)
    .sort((a, b) => b.highestEnabledImpact - b.impact - (a.highestEnabledImpact - a.impact))
    .slice(0, 2)
    .map(toHighlight)

  const keepInMind = state.history
    .filter((r) => !r.lowestImpact)
    .sort((a, b) => b.impact - a.impact || b.highestEnabledImpact - b.impact - (a.highestEnabledImpact - a.impact))
    .slice(0, 5)
    .map(toHighlight)

  const spending = state.history
    .map((r) => ({ label: toHighlight(r).label, cents: r.before.moneyCents - r.after.moneyCents + r.payoutCents }))
    .filter((s) => s.cents > 0)

  const goals = GOAL_ORDER.map((id) => ({ id, status: state.goals[id] }))

  return {
    totals,
    ecoScore: computeEcoScore(totals),
    goals,
    goalsCompleted: goals.filter((g) => g.status === 'COMPLETED').length,
    contributors,
    tradeOffs,
    keepInMind,
    economy: {
      startCents: START_MONEY_CENTS,
      endCents: state.moneyCents,
      choreIncomeCents: state.choreIncomeCents,
      spending,
      startEnergy: START_ENERGY,
      endEnergy: state.energy,
    },
  }
}
