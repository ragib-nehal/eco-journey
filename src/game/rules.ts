// Pure game rules: eligibility, clamped effects, arrival time, checkpoints.
import {
  ENERGY_MAX,
  ENERGY_MIN,
  GIFT_TARGET_CENTS,
  GOALS,
  GOAL_ORDER,
  PRACTICE_MIN_ENERGY,
  TEST_DEADLINE_MIN,
} from './initialState.ts'
import { DAY_END_MIN, SCENARIOS } from './scenarios.ts'
import type { Availability, GameState, GoalId, GoalStatus, Option, Resources, Scenario } from './types.ts'
import { formatMoney } from './format.ts'

/** Total impact points (C + W + R) an option adds. */
export function impactOf(option: Option): number {
  const { carbon = 0, water = 0, waste = 0 } = option.effects
  return carbon + water + waste
}

/** Money the option costs up front, in cents (0 for free or paying options). */
export function costOf(option: Option): number {
  return Math.max(0, -(option.effects.moneyCents ?? 0))
}

export function getAvailability(state: GameState, option: Option): Availability {
  const cost = costOf(option)
  if (cost > state.moneyCents) {
    return { enabled: false, reason: `Costs ${formatMoney(cost)}; you have ${formatMoney(state.moneyCents)}.` }
  }
  const missing = (option.requires ?? []).filter((flag) => !state.flags.includes(flag))
  if (missing.length > 0) {
    return { enabled: false, reason: option.requiresReason ?? 'Not available right now.' }
  }
  const energyDelta = option.effects.energy ?? 0
  if (state.energy + energyDelta < ENERGY_MIN) {
    return { enabled: false, reason: `Needs ${-energyDelta} Energy; you have ${state.energy}.` }
  }
  return { enabled: true }
}

export function currentScenario(state: GameState): Scenario | null {
  const id = state.queue[0]
  return id ? SCENARIOS[id] : null
}

/** Predicted school arrival for a commute option given the morning so far. */
export function predictedArrival(state: GameState, option: Option): number | null {
  const base = option.effects.baseArrivalMin
  return base === undefined ? null : base + state.morningDelayMin
}

const clampEnergy = (energy: number) => Math.min(ENERGY_MAX, Math.max(ENERGY_MIN, energy))

export function snapshot(state: Resources): Resources {
  const { moneyCents, energy, carbon, water, waste } = state
  return { moneyCents, energy, carbon, water, waste }
}

/**
 * Apply an option exactly once: resources, flags, arrival, history, and the
 * follow-up queue. Assumes the option was checked with getAvailability.
 */
export function applyOption(state: GameState, scenario: Scenario, option: Option): GameState {
  const { effects } = option
  const enabled = scenario.options.filter((o) => getAvailability(state, o).enabled)
  const impact = impactOf(option)
  const payoutCents = option.payoutOnCommitCents ?? 0
  const arrivalMin = predictedArrival(state, option)

  const next: GameState = {
    ...state,
    moneyCents: Math.max(0, state.moneyCents + (effects.moneyCents ?? 0) + payoutCents),
    energy: clampEnergy(state.energy + (effects.energy ?? 0)),
    carbon: state.carbon + (effects.carbon ?? 0),
    water: state.water + (effects.water ?? 0),
    waste: state.waste + (effects.waste ?? 0),
    morningDelayMin: state.morningDelayMin + (effects.morningDelayMin ?? 0),
    arrivalMin: arrivalMin ?? state.arrivalMin,
    choreIncomeCents: state.choreIncomeCents + payoutCents,
    flags: [...new Set([...state.flags, ...(effects.setFlags ?? [])])],
    queue: option.followUp ? [option.followUp, ...state.queue.slice(1)] : state.queue.slice(1),
  }

  next.history = [
    ...state.history,
    {
      scenarioId: scenario.id,
      optionId: option.id,
      timeMin: scenario.timeMin,
      before: snapshot(state),
      after: snapshot(next),
      impact,
      lowestImpact: enabled.every((o) => impactOf(o) >= impact),
      highestEnabledImpact: Math.max(...enabled.map(impactOf)),
      durationMin: effects.durationMin ?? 0,
      arrivalMin: arrivalMin ?? undefined,
      payoutCents,
    },
  ]
  return next
}

/** The next goal whose checkpoint has been reached and is still ACTIVE. */
export function dueCheckpoint(state: GameState): GoalId | null {
  const nextId = state.queue[0]
  const nextTime = nextId ? SCENARIOS[nextId].timeMin : DAY_END_MIN
  return GOAL_ORDER.find((id) => state.goals[id] === 'ACTIVE' && GOALS[id].checkpointMin <= nextTime) ?? null
}

export function evaluateGoal(state: GameState, goal: GoalId): GoalStatus {
  switch (goal) {
    case 'test':
      return state.arrivalMin !== null && state.arrivalMin <= TEST_DEADLINE_MIN ? 'COMPLETED' : 'MISSED'
    case 'practice':
      return state.energy >= PRACTICE_MIN_ENERGY ? 'COMPLETED' : 'MISSED'
    case 'gift':
      return state.moneyCents >= GIFT_TARGET_CENTS ? 'COMPLETED' : 'MISSED'
  }
}
