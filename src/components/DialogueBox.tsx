import type { ReactNode } from 'react'
import type { Speaker } from '../game/types.ts'
import { type Expression, portraitFor, SPEAKER_NAMES } from '../ui/assets.ts'

interface DialogueBoxProps {
  speaker: Speaker
  expression?: Expression
  title: string
  children: ReactNode
}

export function DialogueBox({ speaker, expression = 'neutral', title, children }: DialogueBoxProps) {
  return (
    <section className="dialogue px-panel" aria-label={title}>
      <div className="dialogue__portrait">
        <img className="px-sprite" src={portraitFor(speaker, expression)} alt="" aria-hidden="true" draggable={false} />
        <span className="dialogue__name">{SPEAKER_NAMES[speaker]}</span>
      </div>
      <div className="dialogue__text">
        <h2 className="dialogue__title">{title}</h2>
        <div className="dialogue__body">{children}</div>
      </div>
    </section>
  )
}
