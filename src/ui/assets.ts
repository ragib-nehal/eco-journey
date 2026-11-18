// URLs and loading for the baked pixel-art assets in public/assets/pixel.
// Regenerate them with `npm run bake:pixel`.
import type { SceneId, Speaker } from '../game/types.ts'

const base = `${import.meta.env.BASE_URL}assets/pixel`

export const STAGE_W = 320
export const STAGE_H = 180

export const sceneUrl = (scene: SceneId) => `${base}/scenes/${scene}.png`
export const spriteUrl = (name: string) => `${base}/sprites/${name}.png`
export const portraitUrl = (name: string) => `${base}/portraits/${name}.png`

export type Expression = 'neutral' | 'happy' | 'worried' | 'thinking' | 'sleepy' | 'surprised'

export function portraitFor(speaker: Speaker, expression: Expression = 'neutral'): string {
  return portraitUrl(speaker === 'student' ? `student-${expression}` : speaker)
}

export const SPEAKER_NAMES: Record<Speaker, string> = {
  student: 'You',
  friend: 'Friend',
  dad: 'Dad',
  mom: 'Mom',
}

const cache = new Map<string, Promise<HTMLImageElement>>()

export function loadImage(url: string): Promise<HTMLImageElement> {
  let promise = cache.get(url)
  if (!promise) {
    promise = new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error(`Could not load ${url}`))
      image.src = url
    })
    cache.set(url, promise)
  }
  return promise
}
