// Event flow: phases, event order, follow-up insertion, and checkpoints.
// The reducer is pure, so React StrictMode double-invocation cannot apply an
// effect twice.
import { createInitialState, GOALS } from './initialState.ts'
import { applyOption, currentScenario, dueCheckpoint, evaluateGoal, getAvailability } from './rules.ts'
import { DAY_END_MIN, SCENARIOS } from './scenarios.ts'
import type { GameAction, GameState } from './types.ts'

/** Move on from feedback or a checkpoint: next checkpoint, event, or results. */
function advance(state: GameState): GameState {
  const goal = dueCheckpoint(state)
  if (goal) {
    return {
      ...state,
      phase: 'checkpoint',
      checkpointGoal: goal,
      timeMin: GOALS[goal].checkpointMin,
      goals: { ...state.goals, [goal]: evaluateGoal(state, goal) },
    }
  }
  const nextId = state.queue[0]
  if (!nextId) {
    return { ...state, phase: 'results', checkpointGoal: null, timeMin: DAY_END_MIN }
  }
  return { ...state, phase: 'deciding', checkpointGoal: null, timeMin: SCENARIOS[nextId].timeMin }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START':
      if (state.phase !== 'start') return state
      return { ...createInitialState(), phase: 'deciding' }

    case 'CHOOSE': {
      if (state.phase !== 'deciding') return state
      const scenario = currentScenario(state)
      const option = scenario?.options.find((o) => o.id === action.optionId)
      // Re-check eligibility: an ineligible or unknown option changes nothing.
      if (!scenario || !option || !getAvailability(state, option).enabled) return state
      return { ...applyOption(state, scenario, option), phase: 'feedback' }
    }

    case 'CONTINUE':
      if (state.phase !== 'feedback' && state.phase !== 'checkpoint') return state
      return advance(state)

    case 'RESTART':
      return createInitialState()
  }
}
