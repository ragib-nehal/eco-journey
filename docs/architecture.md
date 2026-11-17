# Architecture

The initial prototype is a browser app: React, TypeScript, and Vite, with
plain CSS and `useReducer`. There is no backend or dedicated game engine.

| Concern | Module |
| --- | --- |
| Scenario content | `src/game/scenarios.ts` |
| Scoring and progression rules | `src/game/rules.ts` |
| Playthrough state | `src/game/types.ts`, `initialState.ts`, `reducer.ts` |
| Reusable interface | `src/components/` |
| Start, play, and results flow | `src/screens/` |
| Visual styling | `src/styles/` |
| Rule tests | `src/tests/` |
| Runtime art | `public/assets/` |

These source files are structural placeholders. Gameplay is not implemented
yet. One play screen should host every scenario; do not add a screen per
event.

## Potential systems

### Game presentation / interface

Displays scenes, choices, instructions, scores, and feedback. It should
separate presentation from decision and scoring rules so that content can be
updated without rewriting the interface.

### Scene management

Controls the sequence of daily situations, transitions between scenes, and
the end-of-day summary. It should know which scenario comes next without
owning the details of how a choice is scored.

### Player interaction

Receives input, presents available actions, confirms selections, and
communicates invalid or incomplete actions clearly. Input methods and
platform-specific interaction patterns are **TBD**.

### Decision system

Represents scenarios, available choices, prerequisites, and selected
decisions. It should provide consistent data to scoring and feedback systems.

### Environmental impact scoring

Converts a decision into an impact result using an agreed, documented model.
The model, data sources, categories, and uncertainty handling are **TBD**;
the system must not imply unsupported scientific precision.

### Educational feedback

Explains the result of a decision in accessible language and connects it to
the learning objectives. It may provide comparisons or reflection prompts
without presenting a single choice as universally correct when context
matters.

### State management

Tracks the current scene, selected decisions, impact summary, and progress
for the active playthrough. It should define clear ownership and transitions
between systems.

### Persistence (optional)

Could save settings, progress, or completed playthroughs. Whether persistence
is needed, what data is stored, and the storage mechanism are **TBD**. Any
stored data should be minimized and documented.

## Boundaries and future decisions

Data formats for scenario content, the exact scoring values, and whether
progress is saved are still open. The prototype has no database. Game-logic
tests belong in `src/tests/` and run with Vitest. Deployment beyond a local
Vite build is not decided.
