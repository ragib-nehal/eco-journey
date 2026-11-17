# Technology Stack Decision

## Status

**Selected for the initial prototype** — React + TypeScript without a
dedicated game engine, built with Vite.

## Context

The team of six needs a practical way to build and test an educational,
primarily 2D experience. The repository remains technology-agnostic while
the options below are evaluated.

## Evaluation criteria

Each option should be considered against:

- Learning curve
- 2D development capabilities
- Browser deployment
- Team collaboration
- AI-assisted development
- Development speed
- Testing and automation
- Maintainability

## Options

| Option | Learning curve | 2D capabilities | Browser deployment | Collaboration | AI assistance | Speed | Testing / automation | Maintainability |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Unity + C# | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| Godot + GDScript | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| React + Phaser + TypeScript | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| React + TypeScript without a dedicated game engine | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |

These entries are intentionally unscored until the team researches them using
the same assumptions and records evidence.

## Decision

The initial playable prototype uses:

- React + TypeScript + Vite
- Plain CSS for styling and animation
- React `useReducer` for playthrough state
- Vitest for game-logic tests
- No backend, database, or dedicated game engine

Scenario content, scoring rules, state transitions, and React presentation
stay in separate modules. The comparison table above is still unscored
research context; this decision is the stack for the prototype, not a scored
evaluation of Unity or Godot.

## Consequences

Contributors need a current Node.js toolchain. The game runs in the browser.
Rules can be tested without rendering. Art in `public/assets/` is served as
static files. Persistence, packaging beyond the Vite build, and any later
engine change remain open.
