import { formatMoney, formatTime } from '../game/format.ts'
import { GIFT_TARGET_CENTS, PRACTICE_MIN_ENERGY } from '../game/initialState.ts'
import type { GameState, GoalId, GoalStatus } from '../game/types.ts'

export const STATUS_LABEL: Record<GoalStatus, string> = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  MISSED: 'Missed',
}

/** Status icon: shape differs per status so colour is never the only cue. */
export const STATUS_SPRITE: Record<GoalStatus, string> = {
  ACTIVE: 'clock',
  COMPLETED: 'check',
  MISSED: 'warning',
}

/**
 * One-sentence explanation of a goal outcome. Uses values captured when the
 * goal was evaluated where they can change later in the day.
 */
export function goalExplanation(goal: GoalId, state: GameState, energyAtCheckpoint?: number): string {
  const status = state.goals[goal]
  switch (goal) {
    case 'test': {
      if (state.arrivalMin === null) return 'You have not left for school yet.'
      const at = formatTime(state.arrivalMin)
      return status === 'COMPLETED'
        ? `You arrived at ${at}, in time for the 8:00 AM test.`
        : `You arrived at ${at}, after the test started at 8:00 AM. The day goes on.`
    }
    case 'practice': {
      if (status === 'ACTIVE') return `Checked at 3:00 PM: you need at least ${PRACTICE_MIN_ENERGY} Energy.`
      const energy = energyAtCheckpoint ?? state.energy
      return status === 'COMPLETED'
        ? `You had ${energy} Energy at 3:00 PM, enough for practice (${PRACTICE_MIN_ENERGY} needed).`
        : `You had ${energy} Energy at 3:00 PM, below the ${PRACTICE_MIN_ENERGY} needed for practice.`
    }
    case 'gift': {
      if (status === 'ACTIVE') return `Checked at 10:00 PM: keep at least ${formatMoney(GIFT_TARGET_CENTS)}.`
      return status === 'COMPLETED'
        ? `You kept ${formatMoney(state.moneyCents)}, enough for the ${formatMoney(GIFT_TARGET_CENTS)} gift.`
        : `You had ${formatMoney(state.moneyCents)} left, short of the ${formatMoney(GIFT_TARGET_CENTS)} gift.`
    }
  }
}

/** Energy at the 3:00 PM checkpoint: the last value recorded before the mall. */
export function energyAtPractice(state: GameState): number | undefined {
  const drink = state.history.find((r) => r.scenarioId === 'drink')
  return drink?.after.energy
}
