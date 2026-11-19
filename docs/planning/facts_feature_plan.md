# Facts Feature Plan: Researched evidence under "Why it matters"

## Context
After each decision, `src/components/FeedbackPanel.tsx` shows the outcome, the resource changes, one "Why it matters" line, and a fixed disclaimer: *"Points are simplified game values, not measurements. Explanations are pending source review."* The GDD (section 9) already says each explanatory claim needs a source. The goal is to give **each of the 53 decision options one significant, cited fact**, so players see real evidence for the option's impact. Once a decision has a fact, the "pending source review" wording goes away for it.

Approach agreed with the team:
1. Build the data format, UI and tests, and wire up **2 sample facts** for a test run.
2. After the test run, research the remaining 51 facts (prompt in the appendix).
3. Facts and sources live in **`docs/research/`**, where researchers can edit them without touching game code.
4. Display: the fact plus a short "Source: publisher, year" line in the panel, with full links on the Results screen.

## Design

### 1. Research data: single source of truth in `docs/research/`
**`docs/research/decision-evidence.json`** (new). The game imports this file directly, so it is never copied into code.
```json
{
  "sources": {
    "epa-watersense-showerheads": {
      "publisher": "U.S. EPA WaterSense",
      "title": "Showerheads",
      "year": 2024,
      "url": "https://www.epa.gov/watersense/showerheads",
      "accessed": "2026-11-19"
    }
  },
  "evidence": {
    "shower-quick": {
      "fact": "<one short fact, stated exactly as the source supports>",
      "sourceId": "epa-watersense-showerheads",
      "status": "draft",
      "notes": "Quote/page section supporting the fact; reviewer initials when reviewed"
    }
  }
}
```
- Evidence is keyed by **option id** (`shower-quick`, `teeth-off`, …), so `scenarios.ts` needs no edits.
- `status`: `"draft"` until a teammate checks the fact against the source, then `"reviewed"`.
- `notes` is for researchers only and is never shown in game.

**`docs/research/README.md`** (new): how to add a fact (pick the option id from `src/game/scenarios.ts`, add or reuse a source, keep facts ≤ 180 characters, no numbers the source doesn't state, set `status`), plus how to run `npm test` to validate the file.

### 2. Types and loader
- `src/game/types.ts`: add `Source` (`publisher`, `title`, `year`, `url`, `accessed`) and `Evidence` (`fact`, `sourceId`, `status: 'draft' | 'reviewed'`, `notes?`).
- `src/game/evidence.ts` (new): imports the JSON (`import data from '../../docs/research/decision-evidence.json'`), casts it to typed records, and exports `getEvidence(optionId)`, `getSource(sourceId)` and `EVIDENCE_COVERAGE`.
- `config/tsconfig.app.json`: add `"resolveJsonModule": true`. Vite already supports JSON imports, so no new dependency.

### 3. Feedback panel (`src/components/FeedbackPanel.tsx`)
Under "Why it matters", when `getEvidence(option.id)` returns a fact:
```
Why it matters: Shorter showers use less hot water than longer ones.
▸ <fact>
  — Source: U.S. EPA WaterSense, 2024
```
- Mark it up as `<figure className="feedback__evidence">` with a `<blockquote>` for the fact and a `<figcaption>` for the source. There is no link here, so players stay in the game.
- Conditional note:
  - with evidence: no disclaimer; the sourced fact replaces it (changed after the first test run, since the line added nothing for players). Draft status stays team-only, in the JSON.
  - without evidence: the current text, unchanged
  - The `unmodeled` suffix stays as it is.
- Styles: add `.feedback__evidence` next to `.feedback__why` in `src/styles/pixel-ui.css` (~line 447), using the existing tokens and the VT323 font.

### 4. Results screen (`src/screens/ResultsScreen.tsx`)
- A "Sources" section near Reflection lists the unique sources cited by this run's `state.history` decisions, with publisher, title, year and a link (`target="_blank" rel="noopener noreferrer"`). It is hidden when no choices this run had evidence.
- The note at ~line 176 becomes: *"Impact values are simplified game points, not real-world measurements."*

### 5. Sample facts for the test run
Two facts: `shower-quick` and `teeth-off`. I verify each against the actual source page by web search during implementation. If a fact can't be verified, I enter `[PLACEHOLDER]` text instead (per AGENTS.md: never invent measurements).

### 6. Tests: `src/tests/evidence.test.ts` (new)
- Every evidence key matches a real option id in `SCENARIOS`, which catches typos.
- Every `sourceId` resolves, and every source has an `https://` URL, a publisher, a title and a year.
- Facts are non-empty and ≤ 180 characters.
- No orphan sources.
- A coverage test logs `N / 53 options have evidence` without failing.

### 7. Docs
README "Project status": add a line pointing to `docs/research/` for decision facts.

## Files
| File | Change |
|---|---|
| `docs/planning/facts_feature_plan.md` | new, this plan |
| `docs/research/decision-evidence.json` | new, sources and 2 sample facts |
| `docs/research/README.md` | new, researcher guide |
| `src/game/types.ts` | `Source`, `Evidence` types |
| `src/game/evidence.ts` | new loader and lookups |
| `config/tsconfig.app.json` | `resolveJsonModule` |
| `src/components/FeedbackPanel.tsx` | evidence block, conditional note |
| `src/screens/ResultsScreen.tsx` | Sources section, note |
| `src/styles/pixel-ui.css` | `.feedback__evidence` |
| `src/tests/evidence.test.ts` | new validation tests |
| `README.md` | one-line pointer |

No new dependencies.

## Verification
1. `npm test`: new and existing tests pass.
2. `npm run build`: the type check passes with the JSON import.
3. `npm run dev`: choosing **Quick 5-minute shower** shows the fact and the source line, with no disclaimer below it. Choosing an option without evidence shows the old disclaimer.
4. At the end of a run, the Results screen lists the cited sources with working links.
5. At phone width, the evidence block wraps without overflowing.

---

## Appendix: research hand-off prompt (use after the test run)

> You are helping research educational facts for Eco Journey, a one-day sustainability decision game. Work in this repository.
>
> 1. Read `docs/research/README.md`, `docs/research/decision-evidence.json`, and `src/game/scenarios.ts`.
> 2. For **every option id in `scenarios.ts` that has no entry in `evidence`**, find ONE significant fact that explains that choice's environmental impact (carbon, water or waste) compared with the other options in the same scenario.
> 3. Rules:
>    - Use reputable primary sources only: government agencies (EPA, Energy Star, DOE, EIA, USDA), intergovernmental bodies (IPCC, UNEP, FAO), peer-reviewed research, or established research organisations (Water Footprint Network, Our World in Data). No blogs or product marketing.
>    - Open and read each source page. State only what the source states, with the same numbers and units and no rounding beyond the source. Paste the supporting sentence into `notes`.
>    - If a comparison depends on context (electricity mix, product type, etc.), say so in the fact rather than overstating it.
>    - Keep each fact ≤ 180 characters, in plain language for a teen audience.
>    - Reuse an existing `sources` entry when the same page applies. Otherwise add one with publisher, title, year, https URL and today's date as `accessed`.
>    - Set every new entry to `"status": "draft"`. Never mark anything `"reviewed"`.
>    - If no reliable source supports a useful fact for an option, skip it and list it at the end. Do not guess.
> 4. Run `npm test` and fix any validation failures.
> 5. Report: options filled, options skipped (and why), and any fact that seems to contradict the game's current point values in `scenarios.ts`. Don't change point values; just flag them for the team.
