import { useState } from 'react'
import { spriteUrl } from '../ui/assets.ts'

interface PixelSpriteProps {
  name: string
  /** Integer scale so every sprite pixel stays square and crisp. */
  scale?: number
  alt?: string
  className?: string
}

/** A baked sprite scaled by a whole number with nearest-neighbour sampling. */
export function PixelSprite({ name, scale = 2, alt = '', className = '' }: PixelSpriteProps) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)
  return (
    <img
      src={spriteUrl(name)}
      alt={alt}
      aria-hidden={alt === '' ? true : undefined}
      className={`px-sprite ${className}`}
      width={size ? size.w * scale : undefined}
      height={size ? size.h * scale : undefined}
      onLoad={(event) => setSize({ w: event.currentTarget.naturalWidth, h: event.currentTarget.naturalHeight })}
      draggable={false}
    />
  )
}
