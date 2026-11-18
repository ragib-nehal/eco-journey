import { GOALS, GOAL_ORDER } from '../game/initialState.ts'
import type { GameState } from '../game/types.ts'
import { energyAtPractice, goalExplanation, STATUS_LABEL, STATUS_SPRITE } from '../ui/goalText.ts'
import { PixelSprite } from './PixelSprite.tsx'

interface GoalTrackerProps {
  state: GameState
}

export function GoalTracker({ state }: GoalTrackerProps) {
  const completed = GOAL_ORDER.filter((id) => state.goals[id] === 'COMPLETED').length
  return (
    <aside className="goals px-panel" aria-labelledby="goals-title">
      <h2 id="goals-title" className="panel-title">
        Today&rsquo;s goals <span className="goals__count">{completed}/3</span>
      </h2>
      <ul className="goals__list">
        {GOAL_ORDER.map((id) => {
          const goal = GOALS[id]
          const status = state.goals[id]
          return (
            <li key={id} className={`goal goal--${status.toLowerCase()}`}>
              <PixelSprite name={goal.sprite} />
              <div className="goal__body">
                <div className="goal__head">
                  <strong>{goal.title}</strong>
                  <span className="badge">
                    <PixelSprite name={STATUS_SPRITE[status]} scale={1} />
                    {STATUS_LABEL[status]}
                  </span>
                </div>
                <p className="goal__req">
                  {status === 'ACTIVE' ? goal.requirement : goalExplanation(id, state, energyAtPractice(state))}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
