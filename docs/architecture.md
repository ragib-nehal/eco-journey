# Architecture

This document describes a technology-neutral shape for the game. All
technology-specific choices are **TBD** until the team completes the stack
decision.

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

The team should agree on data formats, system interfaces, content workflow,
testing strategy, and deployment approach after selecting a technology stack.
No engine, language, framework, database, or hosting service is selected yet.
