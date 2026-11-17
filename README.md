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

**Prototype structure**

The playable prototype is scaffolded and gameplay is not implemented yet.
Scenario data, rules, state, and React screens are separate modules under
`src/`.

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

- `src/components/` — reusable HUD, goals, decisions, dialogue, and feedback
- `src/screens/` — start, play, and results
- `src/game/` — types, initial state, rules, reducer, and scenario data
- `src/styles/` — global, pixel UI, and animation styles
- `src/tests/` — Vitest tests for game logic