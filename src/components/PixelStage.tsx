// The 320x180 pixel-art stage. Draws the scene, the focused sprite in a
// pixel speech bubble, and simple ambient effects, then lets CSS scale the
// canvas up with nearest-neighbour sampling.
import { useEffect, useRef } from 'react'
import type { SceneId } from '../game/types.ts'
import { loadImage, sceneUrl, spriteUrl, STAGE_H, STAGE_W } from '../ui/assets.ts'
import { prefersReducedMotion } from '../ui/motion.ts'

export type Ambience = 'steam' | 'rain' | 'sparkle'

interface PixelStageProps {
  scene: SceneId
  sprite?: string | null
  ambience?: Ambience | null
  label: string
}

const INK = '#2a2238'
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
const FADE_MS = 360
const FRAME_MS = 1000 / 12

function drawBubble(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = INK
  ctx.fillRect(x + 2, y, w - 4, h)
  ctx.fillRect(x, y + 2, w, h - 4)
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2)
  ctx.fillStyle = '#fff8e7'
  ctx.fillRect(x + 2, y + 1, w - 4, h - 2)
  ctx.fillRect(x + 1, y + 2, w - 2, h - 4)
  ctx.fillStyle = '#e8dcc0'
  ctx.fillRect(x + 2, y + h - 3, w - 4, 1)
  // Tail.
  const tx = x + Math.floor(w / 2) - 3
  ctx.fillStyle = INK
  ctx.fillRect(tx, y + h, 7, 1)
  ctx.fillRect(tx + 1, y + h + 1, 5, 1)
  ctx.fillRect(tx + 2, y + h + 2, 3, 1)
  ctx.fillRect(tx + 3, y + h + 3, 1, 1)
  ctx.fillStyle = '#fff8e7'
  ctx.fillRect(tx + 1, y + h - 1, 5, 1)
  ctx.fillRect(tx + 2, y + h, 3, 1)
  ctx.fillRect(tx + 3, y + h + 1, 1, 1)
}

interface RainLayer {
  count: number
  color: string
  /** Streak length in pixels. */
  length: number
  /** Pixels fallen per frame. */
  speed: number
  /** Sideways pixels per frame (wind). */
  drift: number
  seed: number
}

/** Far drops sit behind the speech bubble; near drops fall in front of it. */
const RAIN_FAR: RainLayer = { count: 90, color: 'rgba(150, 175, 225, 0.55)', length: 3, speed: 4, drift: 1, seed: 17 }
const RAIN_NEAR: RainLayer = { count: 60, color: 'rgba(205, 225, 255, 0.9)', length: 7, speed: 9, drift: 3, seed: 53 }

function drawRain(ctx: CanvasRenderingContext2D, frame: number, layer: RainLayer) {
  ctx.fillStyle = layer.color
  // The tail trails up and to the right, back along the drop's path.
  const step = Math.max(1, Math.round(layer.speed / layer.drift))
  for (let i = 0; i < layer.count; i++) {
    const seedX = (i * 73 + layer.seed * 31) % STAGE_W
    const seedY = (i * 131 + layer.seed * 7) % STAGE_H
    const x = (seedX - frame * layer.drift + STAGE_W * 64) % STAGE_W
    const y = ((seedY + frame * layer.speed) % (STAGE_H + 10)) - 10
    for (let d = 0; d < layer.length; d++) ctx.fillRect(x + Math.floor(d / step), y - d, 1, 1)
  }
}

/** Tiny splashes popping on the wet ground. */
function drawSplashes(ctx: CanvasRenderingContext2D, frame: number) {
  ctx.fillStyle = 'rgba(215, 230, 255, 0.85)'
  for (let i = 0; i < 16; i++) {
    const phase = (frame + i * 7) % 12
    if (phase > 3) continue
    // Each splash moves to a new spot every cycle.
    const cycle = Math.floor((frame + i * 7) / 12)
    const x = (i * 97 + cycle * 53) % STAGE_W
    const y = 150 + ((i * 29 + cycle * 11) % 26)
    if (phase < 2) ctx.fillRect(x, y, 1, 1)
    else {
      ctx.fillRect(x - 2, y - 1, 1, 1)
      ctx.fillRect(x + 2, y - 1, 1, 1)
      ctx.fillRect(x - 1, y, 1, 1)
      ctx.fillRect(x + 1, y, 1, 1)
    }
  }
}

function drawSteam(ctx: CanvasRenderingContext2D, frame: number, cx: number, cy: number) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
  for (let i = 0; i < 10; i++) {
    const life = (frame + i * 7) % 40
    const x = cx - 30 + ((i * 17) % 60) + Math.round(Math.sin((life + i) / 5) * 2)
    const y = cy + 30 - life
    const size = life < 12 ? 3 : life < 26 ? 4 : 2
    ctx.fillRect(x, y, size, size)
  }
}

function drawSparkle(ctx: CanvasRenderingContext2D, frame: number, cx: number, cy: number) {
  const spots = [
    [-44, -20], [42, -26], [-38, 18], [46, 12], [0, -40],
  ]
  spots.forEach(([dx, dy], i) => {
    const phase = (frame + i * 5) % 20
    if (phase > 12) return
    const r = phase < 4 || phase > 8 ? 1 : 2
    const x = cx + dx
    const y = cy + dy
    ctx.fillStyle = '#fff3a6'
    ctx.fillRect(x - r, y, r * 2 + 1, 1)
    ctx.fillRect(x, y - r, 1, r * 2 + 1)
  })
}

/** Ordered-dither fade to dark; `t` goes from 1 (covered) to 0 (clear). */
function drawDitherFade(ctx: CanvasRenderingContext2D, t: number) {
  if (t <= 0) return
  ctx.fillStyle = INK
  const threshold = t * 16
  for (let y = 0; y < STAGE_H; y += 2) {
    for (let x = 0; x < STAGE_W; x += 2) {
      if (BAYER[((y >> 1) & 3) * 4 + ((x >> 1) & 3)] < threshold) ctx.fillRect(x, y, 2, 2)
    }
  }
}

export function PixelStage({ scene, sprite, ambience, label }: PixelStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneChangedAt = useRef(0)
  const lastScene = useRef<SceneId | null>(null)

  useEffect(() => {
    if (lastScene.current !== null && lastScene.current !== scene) sceneChangedAt.current = performance.now()
    lastScene.current = scene
  }, [scene])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.imageSmoothingEnabled = false
    let cancelled = false
    let raf = 0
    let background: HTMLImageElement | null = null
    let item: HTMLImageElement | null = null
    const reduced = prefersReducedMotion()

    const bubble = { x: 124, y: 26, w: 72, h: 64 }
    const cx = bubble.x + bubble.w / 2
    const cy = bubble.y + bubble.h / 2

    const draw = (now: number) => {
      const frame = reduced ? 0 : Math.floor(now / FRAME_MS)
      if (background) ctx.drawImage(background, 0, 0, STAGE_W, STAGE_H)
      else {
        ctx.fillStyle = INK
        ctx.fillRect(0, 0, STAGE_W, STAGE_H)
      }
      if (ambience === 'rain') {
        // A cool, damp wash, then the far rain layer behind the bubble.
        ctx.fillStyle = 'rgba(30, 40, 80, 0.14)'
        ctx.fillRect(0, 0, STAGE_W, STAGE_H)
        drawRain(ctx, frame, RAIN_FAR)
      }
      if (item) {
        const bob = reduced ? 0 : Math.round(Math.sin(frame / 4))
        drawBubble(ctx, bubble.x, bubble.y + bob, bubble.w, bubble.h)
        const scale = Math.max(1, Math.floor(Math.min(56 / item.width, 52 / item.height)))
        const w = item.width * scale
        const h = item.height * scale
        ctx.drawImage(item, Math.round(cx - w / 2), Math.round(cy - h / 2) + bob, w, h)
      }
      if (ambience === 'rain') {
        drawRain(ctx, frame, RAIN_NEAR)
        drawSplashes(ctx, reduced ? 2 : frame)
      }
      if (ambience === 'steam') drawSteam(ctx, frame, cx, cy)
      if (ambience === 'sparkle') drawSparkle(ctx, frame, cx, cy)
      const since = now - sceneChangedAt.current
      if (!reduced && since < FADE_MS) drawDitherFade(ctx, 1 - since / FADE_MS)
    }

    let lastDrawn = -1
    const loop = (now: number) => {
      if (cancelled) return
      const frame = Math.floor(now / FRAME_MS)
      if (frame !== lastDrawn) {
        lastDrawn = frame
        draw(now)
      }
      raf = requestAnimationFrame(loop)
    }

    Promise.all([
      loadImage(sceneUrl(scene)).catch(() => null),
      sprite ? loadImage(spriteUrl(sprite)).catch(() => null) : Promise.resolve(null),
    ]).then(([bg, sp]) => {
      if (cancelled) return
      background = bg
      item = sp
      if (reduced) draw(performance.now())
      else raf = requestAnimationFrame(loop)
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [scene, sprite, ambience])

  return (
    <div className="stage">
      <canvas ref={canvasRef} width={STAGE_W} height={STAGE_H} className="stage__canvas" role="img" aria-label={label} />
    </div>
  )
}
