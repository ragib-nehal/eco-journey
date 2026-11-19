import { useCallback, useState, type Dispatch } from 'react'
import { DecisionPanel } from '../components/DecisionPanel.tsx'
import { DialogueBox } from '../components/DialogueBox.tsx'
import { ContinueButton, FeedbackPanel } from '../components/FeedbackPanel.tsx'
import { GoalTracker } from '../components/GoalTracker.tsx'
import { PixelStage, type Ambience } from '../components/PixelStage.tsx'
import { PixelSprite } from '../components/PixelSprite.tsx'
import { StatusBar } from '../components/StatusBar.tsx'
import { Typewriter } from '../components/Typewriter.tsx'
import { GOALS } from '../game/initialState.ts'
import { getOption, SCENARIOS } from '../game/scenarios.ts'
import type { DecisionRecord, GameAction, GameState, SceneId } from '../game/types.ts'
import type { Expression } from '../ui/assets.ts'
import { goalExplanation, STATUS_LABEL, STATUS_SPRITE } from '../ui/goalText.ts'

interface GameScreenProps {
  state: GameState
  dispatch: Dispatch<GameAction>
}

/** The student's reaction to the latest decision. */
function reactionFor(record: DecisionRecord): Expression {
  const energy = record.after.energy - record.before.energy
  if (energy > 0) return 'happy'
  if (energy < 0) return record.after.energy < 35 ? 'sleepy' : 'worried'
  if (record.payoutCents > 0) return 'happy'
  return 'neutral'
}

const SCENE_LABEL: Record<SceneId, string> = {
  morning: 'Your bedroom and kitchen in the morning sun',
  street: 'A sunny street with a bus stop',
  afternoon: 'The school cafeteria and hallway',
  mall: 'Shop fronts inside the mall',
  rain: 'A rainy street at dusk',
  evening: 'Home in the evening, rain on the windows',
  store: 'Inside the corner store, at the checkout counter',
}

export function GameScreen({ state, dispatch }: GameScreenProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const choose = useCallback((optionId: string) => {
    setPreview(null)
    dispatch({ type: 'CHOOSE', optionId })
  }, [dispatch])
  const proceed = useCallback(() => dispatch({ type: 'CONTINUE' }), [dispatch])

  const last = state.history.at(-1)
  // While deciding, show the upcoming scenario. During feedback and
  // checkpoints the queue has already advanced (and may be empty at the end of
  // the day), so stay on the scenario of the last decision.
  const scenarioId = state.phase === 'deciding' ? state.queue[0] : last?.scenarioId
  const scenario = scenarioId ? SCENARIOS[scenarioId] : null
  if (!scenario) return null

  let stageSprite: string | null = scenario.sprite
  let ambience: Ambience | null = scenario.ambience ?? null
  let panel
  let dialogue

  if (state.phase === 'checkpoint' && state.checkpointGoal) {
    const goal = GOALS[state.checkpointGoal]
    const status = state.goals[goal.id]
    stageSprite = goal.sprite
    ambience = status === 'COMPLETED' ? 'sparkle' : scenario.ambience ?? null
    dialogue = (
      <DialogueBox speaker="student" expression={status === 'COMPLETED' ? 'happy' : 'worried'} title={`Goal check: ${goal.title}`}>
        <p className="checkpoint__status">
          <PixelSprite name={STATUS_SPRITE[status]} /> {STATUS_LABEL[status].toUpperCase()}
        </p>
        <Typewriter key={`checkpoint-${goal.id}`} text={goalExplanation(goal.id, state)} />
        {status === 'MISSED' && <p className="note">A missed goal never ends the day. Keep going!</p>}
      </DialogueBox>
    )
    panel = (
      <div className="checkpoint" aria-live="polite">
        <ContinueButton onContinue={proceed} />
      </div>
    )
  } else if (state.phase === 'feedback' && last) {
    const option = getOption(last.scenarioId, last.optionId)
    if (!option) return null
    stageSprite = option.sprite
    dialogue = (
      <DialogueBox speaker="student" expression={reactionFor(last)} title={scenario.title}>
        <Typewriter key={`feedback-${option.id}`} text={option.feedback.outcome} />
      </DialogueBox>
    )
    panel = <FeedbackPanel option={option} record={last} onContinue={proceed} />
  } else {
    stageSprite = preview ?? scenario.sprite
    dialogue = (
      <DialogueBox
        speaker={scenario.speaker}
        expression="thinking"
        title={scenario.isFollowUp ? `${scenario.title} (follow-up)` : scenario.title}
      >
        <Typewriter key={`prompt-${scenario.id}`} text={scenario.prompt} />
      </DialogueBox>
    )
    panel = <DecisionPanel state={state} scenario={scenario} onChoose={choose} onPreview={setPreview} />
  }

  return (
    <div className="game">
      <StatusBar state={state} />
      <main className="play">
        <section className="play__main">
          <PixelStage
            scene={scenario.scene}
            sprite={stageSprite}
            ambience={ambience}
            label={`${SCENE_LABEL[scenario.scene]}. ${scenario.title}.`}
          />
          {dialogue}
          <div className="panel px-panel">{panel}</div>
        </section>
        <GoalTracker state={state} />
      </main>
    </div>
  )
}
