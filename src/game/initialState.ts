import { DAY_ORDER, time } from './scenarios.ts'
import type { GameState, GoalDefinition, GoalId } from './types.ts'

export const START_MONEY_CENTS = 2500
export const START_ENERGY = 70
export const ENERGY_MIN = 0
export const ENERGY_MAX = 100

export const TEST_DEADLINE_MIN = time(8)
export const PRACTICE_MIN_ENERGY = 20
export const GIFT_TARGET_CENTS = 1200

export const GOALS: Record<GoalId, GoalDefinition> = {
  test: {
    id: 'test',
    title: 'Make it to the test',
    requirement: 'Arrive at school by 8:00 AM.',
    deadlineLabel: '8:00 AM',
    checkpointMin: TEST_DEADLINE_MIN,
    sprite: 'clipboard',
  },
  practice: {
    id: 'practice',
    title: 'Ready for practice',
    requirement: 'Have at least 20 Energy at 3:00 PM.',
    deadlineLabel: '3:00 PM',
    checkpointMin: time(15),
    sprite: 'sports',
  },
  gift: {
    id: 'gift',
    title: 'Save for a gift',
    requirement: 'Keep at least $12 by 10:00 PM.',
    deadlineLabel: '10:00 PM',
    checkpointMin: time(22),
    sprite: 'gift',
  },
}

export const GOAL_ORDER: GoalId[] = ['test', 'practice', 'gift']

/** A fresh run. Restart always returns this, so nothing carries over. */
export function createInitialState(): GameState {
  return {
    phase: 'start',
    queue: [...DAY_ORDER],
    timeMin: time(7),
    moneyCents: START_MONEY_CENTS,
    energy: START_ENERGY,
    carbon: 0,
    water: 0,
    waste: 0,
    morningDelayMin: 0,
    arrivalMin: null,
    choreIncomeCents: 0,
    flags: [],
    goals: { test: 'ACTIVE', practice: 'ACTIVE', gift: 'ACTIVE' },
    checkpointGoal: null,
    history: [],
  }
}
