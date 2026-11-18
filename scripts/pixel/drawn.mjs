// Scenes and sprites authored directly as pixel art in code. These fill gaps
// in the illustrated asset set (outdoor street, mall, rainy evening, cars,
// bags, hand dryer, thermostat, and charger).
import { gridSprite, painter, seeded } from './ops.mjs'

export const STAGE_W = 320
export const STAGE_H = 180

const INK = '#2a2238'

// ---------------------------------------------------------------------------
// Sprites

const car = (body, shade) =>
  gridSprite(
    [
      '......KKKKKKKK......',
      '.....KRRRRRRRRK.....',
      '....KRBBBKBBBBRK....',
      '...KRRBBBKBBBBBRK...',
      '.KKRRRRRRRRRRRRRRKK.',
      'KRRRRRRRRRRRRRRRRRRK',
      'KWRRRRRRRRSRRRRRRRYK',
      'KSSSSSSSSSSSSSSSSSSK',
      'KKKDDDKKKKKKKKKDDDKK',
      '..KDGGDK....KDGGDK..',
      '..KDGGDK....KDGGDK..',
      '...KDDK......KDDK...',
    ],
    { K: INK, R: body, S: shade, B: '#9fd6f0', W: '#fff3b0', Y: '#f0a030', D: '#2f2f3a', G: '#9a9aa8' },
  )

export const drawnSprites = {
  'car-red': car('#d9534f', '#a8393a'),
  'car-blue': car('#4f86c9', '#36609a'),
  dryer: gridSprite(
    [
      '.KKKKKKKKKKKK.',
      'KSSSSSSSSSSSSK',
      'KSWWWWWWWWWWSK',
      'KSSSSSSSSSSSSK',
      'KSSSSKKKKSSSSK',
      'KSSSSKBBKSSSSK',
      'KSSSSSSSSSSSSK',
      'KMMMMMMMMMMMMK',
      '.KKKKKKKKKKKK.',
      '....KKKKKK....',
      '....KDDDDK....',
      '..............',
      '...C..C..C....',
      '..C..C..C.....',
    ],
    { K: INK, S: '#d8dde6', W: '#ffffff', B: '#5ab0e0', M: '#a9b0bd', D: '#4a4f5c', C: '#9fd3f0' },
  ),
  towel: gridSprite(
    [
      'KKKKKKKKKKKKKK',
      'KSSSSSSSSSSSSK',
      'KSWWWWWWWWWWSK',
      'KSSSSSSSSSSSSK',
      'KMMMMMMMMMMMMK',
      'KKKKPPPPPPKKKK',
      '....PPPPPP....',
      '....PQPPPP....',
      '....PPPPPP....',
      '....PPPPQP....',
      '....PPPPPP....',
      '.....PPPPP....',
    ],
    { K: INK, S: '#d8dde6', W: '#ffffff', M: '#a9b0bd', P: '#f4efe2', Q: '#d2c9b4' },
  ),
  thermostat: gridSprite(
    [
      '..KKKKKKKK..',
      '.KWWWWWWWWK.',
      'KWWWKKKKWWWK',
      'KWWKOOOOKWWK',
      'KWKOOYYOOKWK',
      'KWKOYYYYOKWK',
      'KWKOYYYYOKWK',
      'KWKOOYYOOKWK',
      'KWWKOOOOKWWK',
      'KWWWKKKKWWWK',
      'KWWWWWWWWWWK',
      'KWWKRWWBKWWK',
      '.KWWWWWWWWK.',
      '..KKKKKKKK..',
    ],
    { K: INK, W: '#f2efe8', O: '#f08a3c', Y: '#ffd35a', R: '#e05050', B: '#4a90d9' },
  ),
  charger: gridSprite(
    [
      '...K....K...',
      '...K....K...',
      '..KKKKKKKK..',
      '.KWWWWWWWWK.',
      '.KWWWWWWWWK.',
      '.KWWGGWWWWK.',
      '.KWWWWWWWWK.',
      '..KWWWWWWK..',
      '...KKKKKK...',
      '.....KK.....',
      '.....KK.....',
      '......KK....',
      '.......KK...',
      '........K...',
    ],
    { K: INK, W: '#f2efe8', G: '#5fd068' },
  ),
  'bag-plastic': gridSprite(
    [
      '..KK....KK..',
      '.K..K..K..K.',
      '.K..K..K..K.',
      '..KKKKKKKK..',
      '.KWWWWWWWWK.',
      'KWWWWWWWWWWK',
      'KWWVWWWWWWWK',
      'KWWWWWWWWVWK',
      'KWWWWWWWWWWK',
      'KWVWWWWWWWWK',
      'KWWWWWWWVWWK',
      'KWWWWWWWWWWK',
      '.KWWWWWWWWK.',
      '..KKKKKKKK..',
    ],
    { K: INK, W: '#eef2f5', V: '#c5cdd6' },
  ),
  'bag-paper': gridSprite(
    [
      '.KNKNKNKNKN.',
      '.KTTTTTTTTK.',
      '.KNNNNNNNNK.',
      '.KTTTTTTTTK.',
      '.KTTTTTTTTK.',
      '.KTTTTTTTTK.',
      '.KTTTTTTTTK.',
      '.KTTTTTTTTK.',
      '.KTTTTTTTTK.',
      '.KTTTTTTTTK.',
      '.KTTTTTTTTK.',
      '.KTTTTTTTTK.',
      '.KNNNNNNNNK.',
      '.KKKKKKKKKK.',
    ],
    { K: INK, T: '#c9a06a', N: '#a87e4c' },
  ),
  tote: gridSprite(
    [
      '...KKKKKK...',
      '..K......K..',
      '..K......K..',
      '.KKKKKKKKKK.',
      '.KCCCCCCCCK.',
      '.KCCCCCCCCK.',
      '.KCCCGGCCCK.',
      '.KCCGGGGCCK.',
      '.KCCCGGCCCK.',
      '.KCCCCGCCCK.',
      '.KCCCCCCCCK.',
      '.KCCCCCCCCK.',
      '.KCCCCCCCCK.',
      '.KKKKKKKKKK.',
    ],
    { K: INK, C: '#f0e3c8', G: '#5aa55a' },
  ),
}

// ---------------------------------------------------------------------------
// Scenes (320x180)

function windowsGrid(p, x, y, cols, rows, lit, dark, rand, litChance) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const on = rand() < litChance
      p.rect(x + c * 8, y + r * 10, 5, 6, on ? lit : dark)
    }
  }
}

function tree(p, x, ground, leaf, shade) {
  p.rect(x - 1, ground - 14, 3, 14, '#6b4a32')
  p.circle(x, ground - 20, 8, shade)
  p.circle(x - 1, ground - 21, 7, leaf)
  p.circle(x + 3, ground - 24, 3, shade)
}

export function drawStreet() {
  const p = painter(STAGE_W, STAGE_H)
  const rand = seeded(7)
  p.gradient(0, 0, STAGE_W, 112, ['#7fc4ec', '#a9dcf3', '#dff3f6'])
  p.circle(266, 28, 12, '#fff1b8')
  p.circle(266, 28, 9, '#fffbe6')
  for (const [cx, cy, w] of [[40, 22, 34], [120, 14, 26], [196, 34, 30]]) {
    p.rect(cx, cy, w, 6, '#ffffff')
    p.rect(cx + 4, cy - 4, w - 12, 4, '#ffffff')
    p.rect(cx + 2, cy + 6, w - 4, 2, '#e3f1f8')
  }
  // Distant skyline.
  let x = 0
  while (x < STAGE_W) {
    const w = 18 + Math.floor(rand() * 22)
    const h = 22 + Math.floor(rand() * 34)
    p.rect(x, 112 - h, w, h, '#9db6d4')
    x += w + 2
  }
  // Near buildings.
  const fronts = [
    [0, 52, 70, '#d47f63', '#b4614b'],
    [74, 40, 62, '#e8d3a8', '#c9b07f'],
    [140, 60, 58, '#8fb9a8', '#6e9888'],
    [202, 46, 66, '#e5b56e', '#c49450'],
    [272, 56, 48, '#c98a8a', '#a86a6a'],
  ]
  for (const [bx, top, w, face, trim] of fronts) {
    p.rect(bx, top, w, 126 - top, face)
    p.rect(bx, top, w, 3, trim)
    windowsGrid(p, bx + 6, top + 8, Math.floor((w - 8) / 8), Math.floor((112 - top) / 10), '#cfe8f7', '#5a7bb0', rand, 0.55)
    p.rect(bx + Math.floor(w / 2) - 5, 110, 10, 16, '#5b4636')
  }
  tree(p, 70, 126, '#6cbf5a', '#4f9a45')
  tree(p, 200, 126, '#6cbf5a', '#4f9a45')
  tree(p, 300, 126, '#6cbf5a', '#4f9a45')
  // Sidewalk, curb and road.
  p.rect(0, 126, STAGE_W, 16, '#d5ccbd')
  for (let tx = 0; tx < STAGE_W; tx += 16) p.rect(tx, 126, 1, 16, '#bfb5a4')
  p.rect(0, 142, STAGE_W, 3, '#8b8378')
  p.rect(0, 145, STAGE_W, 35, '#4a4a58')
  p.rect(0, 146, STAGE_W, 1, '#5a5a6a')
  for (let lx = 6; lx < STAGE_W; lx += 28) p.rect(lx, 162, 14, 2, '#f0e6c0')
  // Bus stop.
  p.rect(40, 92, 2, 50, '#3f4a5a')
  p.rect(34, 88, 14, 10, '#3d7cc9')
  p.rect(37, 91, 8, 4, '#ffffff')
  p.rect(16, 104, 40, 2, '#3f4a5a')
  p.rect(18, 106, 2, 30, '#3f4a5a')
  p.rect(18, 106, 36, 22, '#bfe0ee')
  p.rect(22, 128, 28, 3, '#8a5a3c')
  return p.image
}

export function drawMall() {
  const p = painter(STAGE_W, STAGE_H)
  p.rect(0, 0, STAGE_W, 14, '#d8c7ad')
  for (let lx = 14; lx < STAGE_W; lx += 48) p.rect(lx, 5, 22, 3, '#fff7d6')
  p.gradient(0, 14, STAGE_W, 106, ['#f3e7d2', '#eadbc2'])
  const shops = [
    [8, '#3fa39a', '#e9f6f3', 'hoodie'],
    [114, '#e0735f', '#fbeee9', 'rack'],
    [220, '#e2b23e', '#fbf3df', 'cups'],
  ]
  for (const [sx, awning, light, kind] of shops) {
    const w = 94
    p.rect(sx, 22, w, 8, '#6b5a4a')
    for (let ax = 0; ax < w; ax += 8) p.rect(sx + ax, 30, 4, 10, awning)
    for (let ax = 4; ax < w; ax += 8) p.rect(sx + ax, 30, 4, 10, light)
    for (let ax = 0; ax < w; ax += 8) p.rect(sx + ax + 1, 40, 2, 2, awning)
    p.rect(sx, 44, w, 72, '#6b5a4a')
    p.rect(sx + 3, 47, 58, 66, '#bfe3ec')
    p.rect(sx + 5, 49, 8, 40, '#d9f0f5')
    p.rect(sx + 66, 47, 25, 69, '#8a7460')
    p.rect(sx + 68, 49, 21, 67, '#a48c75')
    p.rect(sx + 85, 80, 2, 6, '#e9d27a')
    if (kind === 'hoodie') {
      for (const hx of [16, 38]) {
        p.rect(sx + hx, 66, 14, 18, '#f0b43c')
        p.rect(sx + hx - 4, 68, 4, 14, '#f0b43c')
        p.rect(sx + hx + 14, 68, 4, 14, '#f0b43c')
        p.rect(sx + hx + 4, 64, 6, 4, '#a5602a')
        p.rect(sx + hx + 4, 76, 6, 4, '#d99a2b')
      }
      p.rect(sx + 3, 100, 58, 2, '#8a7460')
    } else if (kind === 'rack') {
      p.rect(sx + 8, 60, 48, 2, '#6b6b78')
      const colors = ['#7a9cd6', '#c76d8e', '#8fbf7a', '#d8b26a', '#9a83c9', '#e08a6a']
      colors.forEach((c, i) => p.rect(sx + 10 + i * 7, 62, 6, 24, c))
      p.rect(sx + 8, 100, 48, 2, '#8a7460')
    } else {
      for (const [cx, c] of [[12, '#f29bb6'], [26, '#f7d36b'], [40, '#b9e07a']]) {
        p.rect(sx + cx, 74, 9, 14, '#f4f4f4')
        p.rect(sx + cx + 1, 76, 7, 11, c)
        p.rect(sx + cx + 5, 68, 1, 6, '#e05a7a')
      }
      p.rect(sx + 8, 88, 46, 4, '#8a7460')
    }
  }
  // Tiled floor.
  for (let ty = 120; ty < STAGE_H; ty += 10) {
    for (let tx = 0; tx < STAGE_W; tx += 20) {
      const even = ((tx / 20) + (ty - 120) / 10) % 2 === 0
      p.rect(tx, ty, 20, 10, even ? '#e9dfcf' : '#dccfba')
    }
  }
  p.rect(0, 116, STAGE_W, 4, '#b9a68c')
  // Planters.
  for (const px of [104, 210]) {
    p.rect(px - 6, 104, 14, 14, '#8a5a3c')
    p.circle(px, 98, 7, '#4f9a45')
    p.circle(px + 1, 96, 5, '#6cbf5a')
  }
  return p.image
}

export function drawRainyStreet() {
  const p = painter(STAGE_W, STAGE_H)
  const rand = seeded(42)
  p.gradient(0, 0, STAGE_W, 120, ['#1f1d3a', '#3a3366', '#5a4a7a'])
  let x = 0
  while (x < STAGE_W) {
    const w = 16 + Math.floor(rand() * 20)
    const h = 26 + Math.floor(rand() * 36)
    p.rect(x, 116 - h, w, h, '#2c2850')
    x += w + 1
  }
  const fronts = [
    [0, 44, 76, '#45406b'],
    [80, 58, 70, '#3d3a60'],
    [154, 38, 60, '#4a4470'],
    [218, 52, 102, '#403b66'],
  ]
  for (const [bx, top, w, face] of fronts) {
    p.rect(bx, top, w, 128 - top, face)
    p.rect(bx, top, w, 2, '#5b5486')
    windowsGrid(p, bx + 6, top + 8, Math.floor((w - 8) / 8), Math.floor((116 - top) / 10), '#f5c66b', '#2a2747', rand, 0.45)
  }
  // Street lamps with glow.
  for (const lx of [60, 190, 300]) {
    p.circle(lx, 84, 9, '#5d5277')
    p.circle(lx, 84, 5, '#8a7192')
    p.rect(lx - 1, 84, 2, 46, '#1f1c33')
    p.rect(lx - 4, 80, 8, 5, '#ffd88a')
  }
  p.rect(0, 128, STAGE_W, 14, '#4f4a66')
  for (let tx = 0; tx < STAGE_W; tx += 16) p.rect(tx, 128, 1, 14, '#433e5a')
  p.rect(0, 142, STAGE_W, 3, '#2b283c')
  p.rect(0, 145, STAGE_W, 35, '#2f2d40')
  // Reflections of lamps and windows on the wet road.
  for (const lx of [60, 190, 300]) {
    for (let ry = 148; ry < STAGE_H; ry += 3) p.rect(lx - 2 + ((ry >> 1) % 3), ry, 4, 1, '#8a7a5a')
  }
  for (let lx = 6; lx < STAGE_W; lx += 28) p.rect(lx, 162, 14, 2, '#6a6478')
  // Puddles.
  for (const [px, py, w] of [[24, 168, 30], [130, 172, 40], [236, 166, 26]]) p.rect(px, py, w, 3, '#47456a')
  return p.image
}

/** Corner-store interior with a drinks fridge, snack shelves, and a cashier at the counter. */
export function drawStore() {
  const p = painter(STAGE_W, STAGE_H)
  const rand = seeded(11)
  // Ceiling with strip lights, then the back wall.
  p.rect(0, 0, STAGE_W, 12, '#c9c2b4')
  for (let lx = 10; lx < STAGE_W; lx += 52) {
    p.rect(lx, 4, 30, 3, '#fffbe6')
    p.rect(lx, 7, 30, 1, '#e3dccb')
  }
  p.gradient(0, 12, STAGE_W, 104, ['#f2eadb', '#e6dcc6'])
  p.rect(0, 112, STAGE_W, 4, '#b9a68c')

  // Drinks fridge (left) with two glass doors and rows of bottles.
  p.rect(4, 22, 76, 94, '#5d6b7a')
  p.rect(6, 24, 72, 8, '#3d7cc9')
  p.rect(30, 26, 24, 4, '#ffffff')
  const drinkColors = ['#e05a5a', '#5ab0e0', '#f0c040', '#7ac46a', '#f29bb6', '#ffffff']
  for (const dx of [8, 44]) {
    p.rect(dx, 34, 32, 80, '#bfe3ec')
    for (let row = 0; row < 4; row++) {
      const sy = 52 + row * 20
      p.rect(dx, sy, 32, 2, '#8a9aa8')
      for (let bx = dx + 2; bx < dx + 30; bx += 5) {
        const c = drinkColors[Math.floor(rand() * drinkColors.length)]
        p.rect(bx, sy - 11, 3, 11, c)
        p.rect(bx + 1, sy - 13, 1, 2, '#e8e8f0')
      }
    }
    p.rect(dx + 2, 36, 3, 70, '#e3f4f8')
    p.rect(dx + 28, 70, 2, 12, '#3f4a5a')
  }

  // Low snack shelf (left of centre).
  p.rect(84, 58, 34, 58, '#a07a58')
  const snackColors = ['#e0735f', '#f0b43c', '#7a9cd6', '#8fbf7a', '#c76d8e', '#e9d27a']
  for (let row = 0; row < 3; row++) {
    const sy = 74 + row * 18
    p.rect(84, sy, 34, 3, '#7a5a40')
    for (let bx = 86; bx < 116; bx += 7) {
      const c = snackColors[Math.floor(rand() * snackColors.length)]
      p.rect(bx, sy - 12, 6, 12, c)
      p.rect(bx + 1, sy - 9, 4, 3, '#fff8e7')
    }
  }

  // Wall shelves behind the counter (right).
  p.rect(204, 24, 112, 88, '#d8cbb2')
  for (let row = 0; row < 4; row++) {
    const sy = 40 + row * 18
    p.rect(204, sy, 112, 3, '#8a6a4c')
    for (let bx = 207; bx < 312; bx += 6) {
      if (rand() < 0.2) continue
      const c = snackColors[Math.floor(rand() * snackColors.length)]
      const h = 8 + Math.floor(rand() * 6)
      p.rect(bx, sy - h, 5, h, c)
    }
  }

  // Cashier standing behind the counter.
  const cx = 262
  p.rect(cx - 10, 92, 20, 24, '#3fa39a')
  p.rect(cx - 7, 94, 14, 22, '#e9f6f3')
  p.rect(cx - 14, 94, 4, 16, '#3fa39a')
  p.rect(cx + 10, 94, 4, 16, '#3fa39a')
  p.rect(cx - 3, 88, 6, 4, '#e8b48a')
  p.circle(cx, 80, 8, '#e8b48a')
  p.rect(cx - 8, 70, 16, 5, '#5b3a28')
  p.rect(cx - 9, 72, 3, 8, '#5b3a28')
  p.rect(cx + 6, 72, 3, 8, '#5b3a28')
  p.rect(cx - 4, 79, 2, 2, INK)
  p.rect(cx + 2, 79, 2, 2, INK)
  p.rect(cx - 2, 84, 4, 1, '#b4614b')
  p.rect(cx - 5, 100, 6, 4, '#ffffff')

  // Tiled floor and a welcome mat.
  for (let ty = 116; ty < STAGE_H; ty += 10) {
    for (let tx = 0; tx < STAGE_W; tx += 20) {
      const even = ((tx / 20) + (ty - 116) / 10) % 2 === 0
      p.rect(tx, ty, 20, 10, even ? '#e9e4da' : '#d6cfc2')
    }
  }
  p.rect(0, 152, STAGE_W, 1, '#c4bcae')
  p.rect(110, 158, 60, 14, '#4f7a5a')
  p.rect(112, 160, 56, 10, '#5f8f6a')

  // Counter, register and candy rack in front.
  p.rect(196, 112, 124, 6, '#c49450')
  p.rect(196, 118, 124, 34, '#8a5a3c')
  for (let px = 200; px < 320; px += 24) p.rect(px, 122, 18, 26, '#9a6a48')
  p.rect(212, 96, 26, 16, '#4a4a58')
  p.rect(214, 98, 22, 7, '#7fd0a0')
  p.rect(216, 100, 10, 2, '#2a5a3a')
  p.rect(210, 108, 30, 4, '#3a3a48')
  p.rect(176, 120, 18, 32, '#6b6b78')
  for (let row = 0; row < 3; row++) {
    for (let bx = 178; bx < 192; bx += 5) {
      p.rect(bx, 123 + row * 10, 4, 7, snackColors[(row * 3 + bx) % snackColors.length])
    }
  }

  return p.image
}
