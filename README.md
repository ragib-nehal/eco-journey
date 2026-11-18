# Eco Choices: A Day in Your Life

Eco Choices is an educational serious game about the environmental impact of
ordinary daily decisions. Players move through a simulated day, make choices
about transport, energy, food, shopping, and waste, and receive feedback that
helps connect habits with sustainability.

## Educational purpose

The project aims to help players:

- Recognize the environmental trade-offs in everyday activities.
- Compare possible choices and consider their consequences.
- Practice systems thinking and reflection rather than memorizing a single
  “correct” answer.

## Gameplay concept

Players encounter daily scenarios, choose among plausible options, and see an
environmental impact score with clear educational feedback. The exact scoring
model and presentation remain proposals until they are researched and agreed
by the team.

Planned areas include:

- Transportation and commuting
- Energy and water use
- Food and shopping
- Waste and reuse
- Progress summaries and reflection

## Project status

**Playable one-day MVP with pixel-art graphics**

The full one-day loop is implemented: 14 scheduled events, 4 conditional
follow-ups, three goal checkpoints, money/energy limits, educational feedback,
and an end-of-day report with raw Carbon, Water, and Waste totals and a
relative Eco Score. Scenario data, rules, state, and React screens are separate
modules under `src/`. Most feedback explanations are draft copy awaiting
content and source review (see the header of `src/game/scenarios.ts`).

## Running the game

Requires Node.js 20.19+ or 22.12+.

```bash
npm ci          # install the locked dependencies
npm run dev     # start the dev server, then open the printed address
npm test        # run the game-logic tests
npm run build   # type-check and build to dist/
```

Play with the mouse, touch, or keyboard: Tab moves between choices, 1–5 picks
a choice, and Enter continues.

On Windows, run the commands from a path that starts with an upper-case drive
letter (`C:\...`). Some terminals open the project as `c:\...`, which makes
Vitest load itself twice and fail with
`Cannot read properties of undefined (reading 'config')`.

## Pixel-art graphics

The game draws a 320×180 pixel stage on a canvas and scales it up with
nearest-neighbour sampling. The UI uses stepped pixel borders and the
self-hosted Pixelify Sans font.

The low-resolution art in `public/assets/pixel/` is generated from the
illustrated assets in `public/assets/` by a dependency-free script:

```bash
npm run bake:pixel
```

The script downsamples and posterizes the backgrounds, slices icons and
portraits from the sprite sheets, and draws the scenes the illustrated set
does not cover (street, mall, rainy street) plus a few small sprites (cars,
bags, hand dryer, paper towels, thermostat, charger) directly in code. The
outputs are committed. Re-run the script after changing any source art or
`scripts/pixel/drawn.mjs`.

## Technology stack

The initial prototype uses React, TypeScript, and Vite, with plain CSS,
`useReducer` for game state, and Vitest for game-logic tests. There is no
backend, database, or dedicated game engine. See the
[technology decision record](docs/tech-stack-decision.md).

## Team collaboration

The project is being developed by a team of six university students. Work is
organized through issues, focused branches, pull requests, and peer review.
See [CONTRIBUTING.md](CONTRIBUTING.md) for the lightweight collaboration
workflow.

## Documentation

- [Game Design Document](docs/game-design-document.md)
- [Architecture](docs/architecture.md)
- [Technology Stack Decision](docs/tech-stack-decision.md)
- [Meeting Notes Template](docs/meeting-notes/README.md)
- [Design References](design/README.md)

## Prototype layout

Runtime art is served from `public/assets/`. Vite and the TypeScript project configs live in `config/`. `package.json`, `index.html`, and the root `tsconfig.json` stay at the repository root because npm, Vite, and the editor look for them there.

Source modules:

- `src/components/` — pixel stage, HUD, goals, decisions, dialogue, and feedback
- `src/screens/` — start, play, and results
- `src/game/` — types, initial state, rules, reducer, scenario data, report, and Eco Score
- `src/ui/` — asset URLs and goal explanation text
- `src/styles/` — global, pixel UI, and animation styles
- `src/tests/` — Vitest tests for game logic
- `scripts/` — the pixel-art bake script

## Credits

- Pixelify Sans font: SIL Open Font License 1.1, self-hosted from Google Fonts
  (`public/fonts/`).