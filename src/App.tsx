import { useReducer } from 'react'
import { createInitialState } from './game/initialState.ts'
import { gameReducer } from './game/reducer.ts'
import { GameScreen } from './screens/GameScreen.tsx'
import { ResultsScreen } from './screens/ResultsScreen.tsx'
import { StartScreen } from './screens/StartScreen.tsx'

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)

  if (state.phase === 'start') return <StartScreen onStart={() => dispatch({ type: 'START' })} />
  if (state.phase === 'results') return <ResultsScreen state={state} onRestart={() => dispatch({ type: 'RESTART' })} />
  return <GameScreen state={state} dispatch={dispatch} />
}
