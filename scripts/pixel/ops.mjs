// Image operations used to turn the high-resolution illustrated assets into
// true low-resolution pixel art, plus a tiny painter for code-drawn scenes.
import { createImage } from './png.mjs'

export function hex(color) {
  const value = parseInt(color.replace('#', ''), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

export function crop(image, x, y, w, h) {
  const out = createImage(w, h)
  for (let row = 0; row < h; row++) {
    for (let col = 0; col < w; col++) {
      const sx = x + col
      const sy = y + row
      if (sx < 0 || sy < 0 || sx >= image.w || sy >= image.h) continue
      const s = (sy * image.w + sx) * 4
      const d = (row * w + col) * 4
      out.data.set(image.data.subarray(s, s + 4), d)
    }
  }
  return out
}

/** Crop to the bounding box of pixels whose alpha is at least `threshold`. */
export function trim(image, threshold = 160) {
  let minX = image.w
  let minY = image.h
  let maxX = -1
  let maxY = -1
  for (let y = 0; y < image.h; y++) {
    for (let x = 0; x < image.w; x++) {
      if (image.data[(y * image.w + x) * 4 + 3] >= threshold) {
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
  }
  if (maxX < 0) return image
  return crop(image, minX, minY, maxX - minX + 1, maxY - minY + 1)
}

/**
 * Keep the largest connected shape plus any sizeable shapes overlapping it.
 * Removes fragments of neighbouring items that leak into a sprite-sheet cell.
 */
export function isolateMain(image, threshold = 160, margin = 12) {
  const { w, h, data } = image
  const labels = new Int32Array(w * h).fill(-1)
  const components = []
  for (let start = 0; start < w * h; start++) {
    if (labels[start] !== -1 || data[start * 4 + 3] < threshold) continue
    const id = components.length
    const box = { area: 0, minX: w, minY: h, maxX: 0, maxY: 0 }
    const stack = [start]
    labels[start] = id
    while (stack.length) {
      const p = stack.pop()
      const x = p % w
      const y = (p - x) / w
      box.area++
      box.minX = Math.min(box.minX, x)
      box.maxX = Math.max(box.maxX, x)
      box.minY = Math.min(box.minY, y)
      box.maxY = Math.max(box.maxY, y)
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx
          const ny = y + dy
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
          const n = ny * w + nx
          if (labels[n] === -1 && data[n * 4 + 3] >= threshold) {
            labels[n] = id
            stack.push(n)
          }
        }
      }
    }
    components.push(box)
  }
  if (components.length === 0) return image
  const main = components.reduce((a, b) => (b.area > a.area ? b : a))
  // Large shapes belong to the item wherever they are (e.g. recycling arrows).
  const large = components.map((c) => c.area >= main.area * 0.25)
  const bounds = { minX: w, minY: h, maxX: 0, maxY: 0 }
  components.forEach((c, i) => {
    if (!large[i]) return
    bounds.minX = Math.min(bounds.minX, c.minX)
    bounds.minY = Math.min(bounds.minY, c.minY)
    bounds.maxX = Math.max(bounds.maxX, c.maxX)
    bounds.maxY = Math.max(bounds.maxY, c.maxY)
  })
  // Small shapes are kept only inside the item's bounds (e.g. water drops).
  const keep = components.map(
    (c, i) =>
      large[i] ||
      (c.minX >= bounds.minX - margin &&
        c.maxX <= bounds.maxX + margin &&
        c.minY >= bounds.minY - margin &&
        c.maxY <= bounds.maxY + margin),
  )
  const out = { w, h, data: new Uint8ClampedArray(data) }
  for (let i = 0; i < w * h; i++) {
    const label = labels[i]
    if (label === -1 ? data[i * 4 + 3] > 0 : !keep[label]) out.data[i * 4 + 3] = 0
  }
  return out
}

/** Nearest-neighbour integer upscale. */
export function upscale(image, factor) {
  const out = { w: image.w * factor, h: image.h * factor, data: new Uint8ClampedArray(image.w * image.h * 4 * factor * factor) }
  for (let y = 0; y < out.h; y++) {
    for (let x = 0; x < out.w; x++) {
      const s = (Math.floor(y / factor) * image.w + Math.floor(x / factor)) * 4
      out.data.set(image.data.subarray(s, s + 4), (y * out.w + x) * 4)
    }
  }
  return out
}

/**
 * Box-filter downsample. Colour is averaged from solid source pixels only, so
 * the soft halo around sprite-sheet items does not tint the result, and alpha
 * becomes fully on or off for crisp pixel edges.
 */
export function downsample(image, outW, outH) {
  const out = createImage(outW, outH)
  const sx = image.w / outW
  const sy = image.h / outH
  for (let y = 0; y < outH; y++) {
    for (let x = 0; x < outW; x++) {
      const x0 = Math.floor(x * sx)
      const x1 = Math.max(x0 + 1, Math.floor((x + 1) * sx))
      const y0 = Math.floor(y * sy)
      const y1 = Math.max(y0 + 1, Math.floor((y + 1) * sy))
      let r = 0
      let g = 0
      let b = 0
      let solid = 0
      let covered = 0
      let total = 0
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          const i = (yy * image.w + xx) * 4
          const a = image.data[i + 3]
          total++
          if (a >= 128) covered++
          if (a >= 220) {
            r += image.data[i]
            g += image.data[i + 1]
            b += image.data[i + 2]
            solid++
          }
        }
      }
      const o = (y * outW + x) * 4
      if (solid > 0 && covered / total >= 0.45) {
        out.data[o] = r / solid
        out.data[o + 1] = g / solid
        out.data[o + 2] = b / solid
        out.data[o + 3] = 255
      }
    }
  }
  return out
}

/** Scale so the longest side equals `size`, keeping proportions. */
export function fit(image, size) {
  const scale = size / Math.max(image.w, image.h)
  return downsample(image, Math.max(1, Math.round(image.w * scale)), Math.max(1, Math.round(image.h * scale)))
}

/** Reduce colour depth per channel for a flatter, more pixel-art palette. */
export function posterize(image, levels = 12) {
  const step = 255 / (levels - 1)
  for (let i = 0; i < image.data.length; i += 4) {
    for (let c = 0; c < 3; c++) image.data[i + c] = Math.round(image.data[i + c] / step) * step
  }
  return image
}

/** Darken edge pixels that border transparency, giving sprites a clean outline. */
export function inkEdges(image, amount = 0.45) {
  const copy = new Uint8ClampedArray(image.data)
  const solid = (x, y) => x >= 0 && y >= 0 && x < image.w && y < image.h && copy[(y * image.w + x) * 4 + 3] > 0
  for (let y = 0; y < image.h; y++) {
    for (let x = 0; x < image.w; x++) {
      if (!solid(x, y)) continue
      if (solid(x - 1, y) && solid(x + 1, y) && solid(x, y - 1) && solid(x, y + 1)) continue
      const i = (y * image.w + x) * 4
      for (let c = 0; c < 3; c++) image.data[i + c] = copy[i + c] * (1 - amount) + 30 * amount
    }
  }
  return image
}

// ---------------------------------------------------------------------------
// Painter for scenes drawn directly in code.

export function painter(w, h) {
  const image = createImage(w, h)
  const set = (x, y, rgb) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return
    const i = (y * w + x) * 4
    image.data[i] = rgb[0]
    image.data[i + 1] = rgb[1]
    image.data[i + 2] = rgb[2]
    image.data[i + 3] = 255
  }
  const BAYER = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
  ]
  const api = {
    image,
    px(x, y, color) {
      set(Math.round(x), Math.round(y), hex(color))
    },
    rect(x, y, rw, rh, color) {
      const rgb = hex(color)
      for (let yy = y; yy < y + rh; yy++) for (let xx = x; xx < x + rw; xx++) set(xx, yy, rgb)
    },
    /** Vertical gradient through the given colours using ordered dithering. */
    gradient(x, y, rw, rh, colors) {
      const rgbs = colors.map(hex)
      const bands = rgbs.length - 1
      for (let yy = 0; yy < rh; yy++) {
        const t = (yy / Math.max(1, rh - 1)) * bands
        const band = Math.min(bands - 1, Math.floor(t))
        const local = t - band
        for (let xx = 0; xx < rw; xx++) {
          const threshold = (BAYER[(y + yy) & 3][(x + xx) & 3] + 0.5) / 16
          set(x + xx, y + yy, local > threshold ? rgbs[band + 1] : rgbs[band])
        }
      }
    },
    circle(cx, cy, r, color) {
      const rgb = hex(color)
      for (let yy = -r; yy <= r; yy++) {
        for (let xx = -r; xx <= r; xx++) {
          if (xx * xx + yy * yy <= r * r + r * 0.6) set(cx + xx, cy + yy, rgb)
        }
      }
    },
    /** Paint a sprite (another image) with transparency. */
    stamp(sprite, x, y) {
      for (let yy = 0; yy < sprite.h; yy++) {
        for (let xx = 0; xx < sprite.w; xx++) {
          const i = (yy * sprite.w + xx) * 4
          if (sprite.data[i + 3] > 0) set(x + xx, y + yy, [sprite.data[i], sprite.data[i + 1], sprite.data[i + 2]])
        }
      }
    },
  }
  return api
}

/** Deterministic pseudo-random numbers so baked scenes are reproducible. */
export function seeded(seed) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

/** Build a sprite from rows of characters and a character-to-colour map. */
export function gridSprite(rows, palette) {
  const h = rows.length
  const w = Math.max(...rows.map((row) => row.length))
  const image = createImage(w, h)
  rows.forEach((row, y) => {
    ;[...row].forEach((ch, x) => {
      const color = palette[ch]
      if (!color) return
      const [r, g, b] = hex(color)
      const i = (y * w + x) * 4
      image.data[i] = r
      image.data[i + 1] = g
      image.data[i + 2] = b
      image.data[i + 3] = 255
    })
  })
  return image
}
