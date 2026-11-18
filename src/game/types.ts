// Shared types for the one-day Eco Journey game.
// Money is stored in integer cents; Carbon, Water and Waste are abstract game
// impact points, never physical measurements.

export type Flag = 'hasReusableBottle' | 'momPickup' | 'choreAccepted'

export type ScenarioId =
  | 'shower'
  | 'teeth'
  | 'breakfast'
  | 'bag'
  | 'commute'
  | 'lunch'
  | 'cleanup'
  | 'bathroom'
  | 'drink'
  | 'mall'
  | 'cup'
  | 'travelHome'
  | 'idling'
  | 'dinner'
  | 'chore'
  | 'dishes'
  | 'laundry'
  | 'bed'

/** Pixel-art scene backgrounds baked into public/assets/pixel/scenes. */
export type SceneId = 'morning' | 'street' | 'afternoon' | 'mall' | 'rain' | 'evening' | 'store'

export type Speaker = 'student' | 'friend' | 'dad' | 'mom'

export interface Effects {
  /** Change in money, in cents (negative = cost). */
  moneyCents?: number
  energy?: number
  carbon?: number
  water?: number
  waste?: number
  /** Simulated minutes the activity takes; recorded for feedback only. */
  durationMin?: number
  /** Added to the morning delay used for the school arrival time. */
  morningDelayMin?: number
  /** Reference arrival time (minutes after midnight) for commute options. */
  baseArrivalMin?: number
  setFlags?: Flag[]
}

export interface Feedback {
  /** Plain-language outcome. */
  outcome: string
  /** One short "why it matters" explanation. */
  why: string
}

export interface Option {
  id: string
  label: string
  /** Sprite shown on the option card and stage. */
  sprite: string
  effects: Effects
  /** Flags the player must hold for the option to be available. */
  requires?: Flag[]
  /** Reason shown when a required flag is missing. */
  requiresReason?: string
  /** Follow-up scenario inserted immediately after this choice. */
  followUp?: ScenarioId
  /** Money paid once when this option is committed (the dishes chore). */
  payoutOnCommitCents?: number
  feedback: Feedback
  /** Team review note for values the GDD marks as not yet modeled. */
  unmodeled?: string
}

export interface Scenario {
  id: ScenarioId
  /** Scheduled time in minutes after midnight. */
  timeMin: number
  scene: SceneId
  title: string
  prompt: string
  speaker: Speaker
  /** Sprite shown on the stage while the player decides. */
  sprite: string
  /** Visual effect drawn over the scene. */
  ambience?: 'steam' | 'rain' | 'sparkle'
  isFollowUp?: boolean
  options: Option[]
}

export type GoalId = 'test' | 'practice' | 'gift'
export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'MISSED'

export interface GoalDefinition {
  id: GoalId
  title: string
  requirement: string
  deadlineLabel: string
  /** Checkpoint time in minutes after midnight. */
  checkpointMin: number
  sprite: string
}

export interface Resources {
  moneyCents: number
  energy: number
  carbon: number
  water: number
  waste: number
}

export interface DecisionRecord {
  scenarioId: ScenarioId
  optionId: string
  timeMin: number
  before: Resources
  after: Resources
  /** Impact points (C + W + R) this choice added. */
  impact: number
  /** True when this was the lowest-impact option enabled at the time. */
  lowestImpact: boolean
  /** Highest impact among the options enabled at the time. */
  highestEnabledImpact: number
  durationMin: number
  arrivalMin?: number
  payoutCents: number
}

export type Phase = 'start' | 'deciding' | 'feedback' | 'checkpoint' | 'results'

export interface GameState extends Resources {
  phase: Phase
  /** Upcoming scenarios; the first entry is the current one. */
  queue: ScenarioId[]
  timeMin: number
  morningDelayMin: number
  arrivalMin: number | null
  choreIncomeCents: number
  flags: Flag[]
  goals: Record<GoalId, GoalStatus>
  /** Goal evaluated by the checkpoint currently on screen. */
  checkpointGoal: GoalId | null
  history: DecisionRecord[]
}

export type GameAction =
  | { type: 'START' }
  | { type: 'CHOOSE'; optionId: string }
  | { type: 'CONTINUE' }
  | { type: 'RESTART' }

export interface Availability {
  enabled: boolean
  reason?: string
}
