import { describe, expect, it } from 'vitest'
import { computeBounds, computeEcoScore, metricScore } from '../game/ecoScore.ts'
import { formatMoney, formatTime } from '../game/format.ts'
import { createInitialState } from '../game/initialState.ts'
import { gameReducer } from '../game/reducer.ts'
import { buildReport } from '../game/report.ts'
import { evaluateGoal, getAvailability } from '../game/rules.ts'
import { DAY_ORDER, getOption, SCENARIOS, time } from '../game/scenarios.ts'
import type { GameState, ScenarioId } from '../game/types.ts'

const start = () => gameReducer(createInitialState(), { type: 'START' })

function choose(state: GameState, optionId: string): GameState {
  const next = gameReducer(state, { type: 'CHOOSE', optionId })
  expect(next.phase, `choosing ${optionId} at ${state.queue[0]}`).toBe('feedback')
  return next
}

/** Continue past feedback and any checkpoints to the next decision. */
function proceed(state: GameState): GameState {
  let next = gameReducer(state, { type: 'CONTINUE' })
  while (next.phase === 'checkpoint') next = gameReducer(next, { type: 'CONTINUE' })
  return next
}

function play(optionIds: string[], from: GameState = start()): GameState {
  return optionIds.reduce((state, id) => proceed(choose(state, id)), from)
}

const option = (scenarioId: ScenarioId, optionId: string) => {
  const found = getOption(scenarioId, optionId)
  if (!found) throw new Error(`Unknown option ${optionId}`)
  return found
}

const MORNING_QUICK_BUS = ['shower-quick', 'teeth-off', 'breakfast-skip', 'commute-bus']
const CHEAPEST_DAY = [
  'shower-quick', 'teeth-off', 'breakfast-skip', 'commute-dad', 'lunch-burrito', 'cleanup-sort',
  'bathroom-fast-dryer', 'drink-plastic', 'mall-nothing', 'cup-trash', 'home-mom', 'idling-off',
  'dinner-veggie', 'chore-accept', 'dishes-full', 'laundry-cold', 'bed-heat',
]

describe('budget floor', () => {
  it('disables ride-share with less than $8 while free alternatives stay usable', () => {
    const state: GameState = { ...start(), moneyCents: 799, queue: ['commute'] }
    const ride = getAvailability(state, option('commute', 'commute-rideshare'))
    expect(ride.enabled).toBe(false)
    expect(ride.reason).toContain('$8')
    expect(getAvailability(state, option('commute', 'commute-dad')).enabled).toBe(true)
    expect(getAvailability(state, option('commute', 'commute-bike')).enabled).toBe(true)
    expect(gameReducer(state, { type: 'CHOOSE', optionId: 'commute-rideshare' })).toBe(state)
  })

  it('allows a purchase that uses exactly the remaining money', () => {
    const state: GameState = { ...start(), moneyCents: 800, queue: ['commute'] }
    expect(getAvailability(state, option('commute', 'commute-rideshare')).enabled).toBe(true)
    expect(choose(state, 'commute-rideshare').moneyCents).toBe(0)
  })
})

describe('morning lateness', () => {
  it('quick shower + bus arrives at 7:58 and makes the test', () => {
    const state = play(MORNING_QUICK_BUS)
    expect(state.arrivalMin).toBe(time(7, 58))
    expect(state.goals.test).toBe('COMPLETED')
  })

  it('long shower + bus arrives at 8:13 and misses the test', () => {
    const state = play(['shower-long', 'teeth-off', 'breakfast-skip', 'commute-bus'])
    expect(state.arrivalMin).toBe(time(8, 13))
    expect(state.goals.test).toBe('MISSED')
  })

  it('long shower + ride-share arrives at 8:00 and makes the test', () => {
    const state = play(['shower-long', 'teeth-off', 'breakfast-skip', 'commute-rideshare'])
    expect(state.arrivalMin).toBe(time(8))
    expect(state.goals.test).toBe('COMPLETED')
  })

  it('adds 10 minutes for packing breakfast and saves 5 for skipping the shower', () => {
    expect(play(['shower-quick', 'teeth-off', 'breakfast-pack', 'commute-bike']).arrivalMin).toBe(time(8, 5))
    expect(play(['shower-skip', 'teeth-off', 'breakfast-skip', 'commute-bus']).arrivalMin).toBe(time(7, 53))
  })
})

describe('goal boundaries', () => {
  const base = start()
  it('arrival at exactly 8:00 meets the test goal; 8:01 does not', () => {
    expect(evaluateGoal({ ...base, arrivalMin: time(8) }, 'test')).toBe('COMPLETED')
    expect(evaluateGoal({ ...base, arrivalMin: time(8, 1) }, 'test')).toBe('MISSED')
  })
  it('Energy 20 at 3:00 PM succeeds; 19 misses', () => {
    expect(evaluateGoal({ ...base, energy: 20 }, 'practice')).toBe('COMPLETED')
    expect(evaluateGoal({ ...base, energy: 19 }, 'practice')).toBe('MISSED')
  })
  it('$12.00 at 10:00 PM succeeds; $11.99 misses', () => {
    expect(evaluateGoal({ ...base, moneyCents: 1200 }, 'gift')).toBe('COMPLETED')
    expect(evaluateGoal({ ...base, moneyCents: 1199 }, 'gift')).toBe('MISSED')
  })
})

describe('checkpoints', () => {
  it('evaluates the test right after the morning, before lunch', () => {
    let state = choose(play(MORNING_QUICK_BUS.slice(0, 3)), 'commute-bus')
    state = gameReducer(state, { type: 'CONTINUE' })
    expect(state.phase).toBe('checkpoint')
    expect(state.checkpointGoal).toBe('test')
    expect(state.timeMin).toBe(time(8))
    state = gameReducer(state, { type: 'CONTINUE' })
    expect(state.phase).toBe('deciding')
    expect(state.queue[0]).toBe('lunch')
  })

  it('evaluates practice after the 2:00 PM drink and before the mall', () => {
    let state = play([...MORNING_QUICK_BUS, 'lunch-chicken', 'cleanup-sort', 'bathroom-towels'])
    state = gameReducer(choose(state, 'drink-plastic'), { type: 'CONTINUE' })
    expect(state.checkpointGoal).toBe('practice')
    expect(state.goals.practice).toBe('COMPLETED')
  })

  it('evaluates each goal once and never revises it', () => {
    let state = play([...MORNING_QUICK_BUS, 'lunch-chicken', 'cleanup-sort', 'bathroom-towels'])
    state = choose(state, 'drink-plastic')
    state = proceed({ ...state, energy: 5 })
    expect(state.goals.practice).toBe('MISSED')
    state = play(['mall-new'], state)
    expect(state.energy).toBeGreaterThanOrEqual(20)
    expect(state.goals.practice).toBe('MISSED')
  })
})

describe('conditional events', () => {
  it('buying breakfast leads to the checkout bag prompt in the store scene', () => {
    const atCheckout = proceed(choose(play(['shower-quick', 'teeth-off']), 'breakfast-buy'))
    expect(atCheckout.queue[0]).toBe('bag')
    expect(SCENARIOS.bag.scene).toBe('store')
  })

  it('refill is unavailable unless the reusable bottle was packed', () => {
    const skipped = play([...MORNING_QUICK_BUS, 'lunch-chicken', 'cleanup-sort', 'bathroom-towels'])
    const refill = getAvailability(skipped, option('drink', 'drink-refill'))
    expect(refill.enabled).toBe(false)
    expect(refill.reason).toMatch(/bottle/)

    const packed = play(['shower-quick', 'teeth-off', 'breakfast-pack', 'commute-bus', 'lunch-chicken', 'cleanup-sort', 'bathroom-towels'])
    expect(getAvailability(packed, option('drink', 'drink-refill')).enabled).toBe(true)
  })

  it('bag choice appears only after buying breakfast', () => {
    const bought = proceed(choose(play(['shower-quick', 'teeth-off']), 'breakfast-buy'))
    expect(bought.queue[0]).toBe('bag')
    const packed = proceed(choose(play(['shower-quick', 'teeth-off']), 'breakfast-pack'))
    expect(packed.queue[0]).toBe('commute')
  })

  it('idling choice appears only after asking Mom for a ride', () => {
    const before = play([...MORNING_QUICK_BUS, 'lunch-chicken', 'cleanup-sort', 'bathroom-towels', 'drink-plastic', 'mall-nothing', 'cup-trash'])
    expect(proceed(choose(before, 'home-mom')).queue[0]).toBe('idling')
    expect(proceed(choose(before, 'home-bus')).queue[0]).toBe('dinner')
  })

  it('dish method appears only after accepting the chore', () => {
    const before = play(CHEAPEST_DAY.slice(0, 13))
    expect(before.queue[0]).toBe('chore')
    expect(proceed(choose(before, 'chore-accept')).queue[0]).toBe('dishes')
    expect(proceed(choose(before, 'chore-decline')).queue[0]).toBe('laundry')
  })

  it('the cup follow-up always follows the mall without charging money', () => {
    const before = play([...MORNING_QUICK_BUS, 'lunch-chicken', 'cleanup-sort', 'bathroom-towels', 'drink-plastic'])
    for (const id of ['mall-new', 'mall-thrift', 'mall-nothing']) {
      const after = proceed(choose(before, id))
      expect(after.queue[0]).toBe('cup')
      expect(proceed(choose(after, 'cup-trash')).moneyCents).toBe(after.moneyCents)
    }
  })

  it('follow-ups do not repeat the parent option effects', () => {
    let state = choose(play(['shower-quick', 'teeth-off']), 'breakfast-buy')
    const afterBuy = state.moneyCents
    state = proceed(choose(proceed(state), 'bag-backpack'))
    expect(state.moneyCents).toBe(afterBuy)
    expect(afterBuy).toBe(2500 - 400)
  })
})

describe('chore payout', () => {
  const before = () => play(CHEAPEST_DAY.slice(0, 13))
  it('declining pays $0', () => {
    const state = play(['chore-decline'], before())
    expect(state.moneyCents).toBe(before().moneyCents)
    expect(state.choreIncomeCents).toBe(0)
  })
  it('accepting pays nothing until the dishes are done, then exactly $5 once', () => {
    const start = before()
    const accepted = play(['chore-accept'], start)
    expect(accepted.moneyCents).toBe(start.moneyCents)
    const done = play(['dishes-full', 'laundry-cold', 'bed-heat'], accepted)
    expect(done.moneyCents).toBe(start.moneyCents + 500)
    expect(done.choreIncomeCents).toBe(500)
  })
})

describe('resources', () => {
  it('keeps C, W and R separate and never deducts them as money', () => {
    const state = play(['shower-long', 'teeth-running'])
    expect(state).toMatchObject({ carbon: 2, water: 9, waste: 0, moneyCents: 2500 })
  })

  it('clamps Energy to 0–100', () => {
    const high = choose({ ...start(), energy: 95 }, 'shower-long')
    expect(high.energy).toBe(100)
    const low = { ...start(), energy: 9 }
    expect(getAvailability(low, option('shower', 'shower-skip')).enabled).toBe(false)
  })

  it('ignores CHOOSE for unknown options and outside the deciding phase', () => {
    const state = start()
    expect(gameReducer(state, { type: 'CHOOSE', optionId: 'nope' })).toBe(state)
    const fb = choose(state, 'shower-quick')
    expect(gameReducer(fb, { type: 'CHOOSE', optionId: 'teeth-off' })).toBe(fb)
  })
})

describe('full day', () => {
  it('reaches the report with all goals evaluated, even when goals are missed', () => {
    let state = play(['shower-long', 'teeth-running', 'breakfast-pack', 'commute-bus', 'lunch-beef', 'cleanup-recycling', 'bathroom-towels', 'drink-juice', 'mall-thrift', 'cup-recycling', 'home-bus', 'dinner-beef', 'chore-decline', 'laundry-hot'])
    state = proceed(choose(state, 'bed-unplug'))
    expect(state.phase).toBe('results')
    expect(state.goals).toEqual({ test: 'MISSED', practice: 'COMPLETED', gift: 'MISSED' })
    expect(state.queue).toEqual([])
  })

  it('a missed practice goal still reaches the report', () => {
    let state = play([...MORNING_QUICK_BUS, 'lunch-chicken', 'cleanup-sort', 'bathroom-towels'])
    state = proceed({ ...choose(state, 'drink-plastic'), energy: 0 })
    state = play(['mall-new', 'cup-trash', 'home-mom', 'idling-off', 'dinner-veggie', 'chore-decline', 'laundry-cold', 'bed-unplug'], state)
    expect(state.phase).toBe('results')
    expect(state.goals.practice).toBe('MISSED')
  })

  it('visits every scheduled event in order', () => {
    const state = play(CHEAPEST_DAY)
    const scheduled = state.history.map((r) => r.scenarioId).filter((id) => !SCENARIOS[id].isFollowUp)
    expect(scheduled).toEqual(DAY_ORDER)
    expect(state.phase).toBe('results')
  })

  it('restart resets resources, flags, history and goals', () => {
    const finished = play(CHEAPEST_DAY)
    const restarted = gameReducer(finished, { type: 'RESTART' })
    expect(restarted).toEqual(createInitialState())
  })
})

describe('eco score', () => {
  it('every reachable state has at least one enabled option (no dead ends)', () => {
    expect(() => computeBounds()).not.toThrow()
  })

  it('pins the achievable bounds (rerun after changing point values)', () => {
    expect(computeBounds()).toMatchInlineSnapshot(`
      {
        "carbon": {
          "max": 56,
          "min": 4,
        },
        "waste": {
          "max": 13,
          "min": 1,
        },
        "water": {
          "max": 15,
          "min": 0,
        },
      }
    `)
  })

  it('normalizes, clamps, and handles a metric with no variation', () => {
    expect(metricScore(5, { min: 0, max: 10 })).toBe(50)
    expect(metricScore(-3, { min: 0, max: 10 })).toBe(100)
    expect(metricScore(12, { min: 0, max: 10 })).toBe(0)
    expect(metricScore(4, { min: 4, max: 4 })).toBeNull()
    const score = computeEcoScore(
      { carbon: 2, water: 4, waste: 9 },
      { carbon: { min: 0, max: 10 }, water: { min: 0, max: 8 }, waste: { min: 9, max: 9 } },
    )
    expect(score.metrics).toEqual({ carbon: 80, water: 50, waste: null })
    expect(score.overall).toBe(65)
  })
})

describe('report', () => {
  it('lists biggest contributors, helpful trade-offs and spending', () => {
    const state = play(['shower-long', 'teeth-off', 'breakfast-buy', 'bag-backpack', 'commute-bus', 'lunch-beef', 'cleanup-sort', 'bathroom-towels', 'drink-plastic', 'mall-nothing', 'cup-trash', 'home-split', 'dinner-veggie', 'chore-accept', 'dishes-full', 'laundry-cold', 'bed-heat'])
    const report = buildReport(state)
    expect(report.contributors.map((h) => h.record.optionId)).toEqual(['lunch-beef', 'shower-long', 'breakfast-buy'])
    expect(report.tradeOffs).toHaveLength(2)
    expect(report.tradeOffs.every((h) => h.record.lowestImpact)).toBe(true)
    expect(report.economy.choreIncomeCents).toBe(500)
    expect(report.economy.spending.reduce((sum, s) => sum + s.cents, 0)).toBe(2500 + 500 - state.moneyCents)
    expect(report.goals.find((g) => g.id === 'test')?.status).toBe('MISSED')
    expect(report.goalsCompleted).toBe(2)
  })
})

describe('format', () => {
  it('formats times and money', () => {
    expect(formatTime(time(7, 58))).toBe('7:58 AM')
    expect(formatTime(time(12))).toBe('12:00 PM')
    expect(formatTime(time(22))).toBe('10:00 PM')
    expect(formatMoney(1199)).toBe('$11.99')
    expect(formatMoney(1200)).toBe('$12')
    expect(formatMoney(350)).toBe('$3.50')
  })
})
