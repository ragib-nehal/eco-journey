// Bakes the illustrated assets into low-resolution pixel art for the game.
//
//   node scripts/bake-pixel-art.mjs [--preview <dir>]
//
// Inputs:  public/assets/{backgrounds,icons,characters,props}/*.png
// Outputs: public/assets/pixel/{scenes,sprites,portraits}/*.png
//
// The outputs are committed, so the game does not run this at build time.
// Re-run it after changing any source art or the code-drawn scenes.
// --preview writes an upscaled contact sheet for visual review.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createImage, decodePng, encodePng } from './pixel/png.mjs'
import { crop, downsample, fit, inkEdges, isolateMain, posterize, trim, upscale } from './pixel/ops.mjs'
import { STAGE_H, STAGE_W, drawMall, drawRainyStreet, drawStreet, drawnSprites } from './pixel/drawn.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const assets = join(root, 'public', 'assets')
const outDir = join(assets, 'pixel')
const load = (path) => decodePng(readFileSync(join(assets, path)))
const written = []

function save(group, name, image) {
  const dir = join(outDir, group)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, `${name}.png`), encodePng(image))
  written.push({ group, name, image })
}

// --- Scenes ----------------------------------------------------------------
for (const name of ['morning', 'afternoon', 'evening']) {
  const source = load(`backgrounds/${name}.png`)
  save('scenes', name, posterize(downsample(source, STAGE_W, STAGE_H), 10))
}
save('scenes', 'street', drawStreet())
save('scenes', 'mall', drawMall())
save('scenes', 'rain', drawRainyStreet())

// --- Sprites from the icon sheet (6 x 5 grid) ----------------------------------
const SPRITE_SIZE = 24
const iconSheet = load('icons/resource_action_icons_sheet.png')
const ICON_GRID = [
  ['clock', 'coins', 'battery', 'carbon', 'water', 'recycle'],
  ['trash', 'gift', 'check', 'warning', 'backpack', 'bottle'],
  ['breakfast', 'tray', 'plate', 'shower', 'toothbrush', 'sink'],
  ['bus', 'bike', 'sneaker', 'clipboard', 'sports', 'hoodie'],
  ['dishes', 'washer', 'detergent', 'smoothie', null, null],
]
const cellW = iconSheet.w / 6
const cellH = iconSheet.h / 5
// Left inset (fraction of a cell) where a neighbouring item overlaps the cell.
const ICON_LEFT_INSET = { detergent: 0.3 }
ICON_GRID.forEach((row, r) =>
  row.forEach((name, c) => {
    if (!name) return
    const inset = Math.round((ICON_LEFT_INSET[name] ?? 0) * cellW)
    const cell = crop(iconSheet, Math.round(c * cellW) + inset, Math.round(r * cellH), Math.round(cellW) - inset, Math.round(cellH))
    save('sprites', name, inkEdges(posterize(fit(trim(isolateMain(cell)), SPRITE_SIZE), 12), 0.35))
  }),
)

// --- Sprites from the props sheet (hand-measured boxes) -------------------------
const propSheet = load('props/scenario_props_sheet.png')
const PROP_BOXES = {
  lunchbox: [1150, 30, 275, 220],
  bins: [450, 500, 340, 210],
  laundry: [755, 735, 240, 175],
  notebook: [510, 910, 215, 176],
  alarm: [780, 905, 190, 181],
}
for (const [name, [x, y, w, h]] of Object.entries(PROP_BOXES)) {
  save('sprites', name, inkEdges(posterize(fit(trim(isolateMain(crop(propSheet, x, y, w, h))), name === 'bins' ? 32 : SPRITE_SIZE), 12), 0.35))
}

// --- Code-drawn sprites -----------------------------------------------------------
for (const [name, image] of Object.entries(drawnSprites)) save('sprites', name, image.w < 16 ? upscale(image, 2) : image)

// --- Portraits (hand-measured boxes on the character sheet) -----------------------
const PORTRAIT_H = 48
const portraitSheet = load('characters/student_and_supporting_portraits_sheet.png')
const PORTRAIT_BOXES = {
  'student-neutral': [10, 140, 240, 365],
  'student-happy': [250, 140, 240, 365],
  'student-worried': [490, 140, 230, 365],
  'student-thinking': [722, 140, 230, 365],
  'student-sleepy': [952, 140, 240, 365],
  'student-surprised': [1192, 140, 250, 365],
  friend: [165, 560, 345, 420],
  dad: [530, 560, 390, 420],
  mom: [940, 560, 355, 420],
}
for (const [name, [x, y, w, h]] of Object.entries(PORTRAIT_BOXES)) {
  const trimmed = trim(crop(portraitSheet, x, y, w, h))
  const outW = Math.round((trimmed.w / trimmed.h) * PORTRAIT_H)
  save('portraits', name, inkEdges(posterize(downsample(trimmed, outW, PORTRAIT_H), 12), 0.3))
}

// --- Optional preview contact sheet -----------------------------------------------
const previewIndex = process.argv.indexOf('--preview')
if (previewIndex > -1) {
  const dir = process.argv[previewIndex + 1]
  mkdirSync(dir, { recursive: true })
  const groups = ['scenes', 'sprites', 'portraits']
  for (const group of groups) {
    const items = written.filter((item) => item.group === group)
    const scale = group === 'scenes' ? 2 : 4
    const cols = group === 'scenes' ? 2 : 8
    const cellW2 = Math.max(...items.map((i) => i.image.w)) * scale + 8
    const cellH2 = Math.max(...items.map((i) => i.image.h)) * scale + 8
    const rows = Math.ceil(items.length / cols)
    const sheet = createImage(cellW2 * cols, cellH2 * rows)
    sheet.data.fill(70)
    for (let i = 3; i < sheet.data.length; i += 4) sheet.data[i] = 255
    items.forEach(({ image }, index) => {
      const ox = (index % cols) * cellW2 + 4
      const oy = Math.floor(index / cols) * cellH2 + 4
      for (let y = 0; y < image.h * scale; y++) {
        for (let x = 0; x < image.w * scale; x++) {
          const s = (Math.floor(y / scale) * image.w + Math.floor(x / scale)) * 4
          if (image.data[s + 3] === 0) continue
          const d = ((oy + y) * sheet.w + ox + x) * 4
          sheet.data.set(image.data.subarray(s, s + 4), d)
        }
      }
    })
    writeFileSync(join(dir, `preview-${group}.png`), encodePng(sheet))
  }
  console.log(`Preview sheets written to ${dir}`)
}

console.log(`Baked ${written.length} pixel-art images into public/assets/pixel/`)
