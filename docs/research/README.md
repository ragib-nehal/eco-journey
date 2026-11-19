# Decision evidence

`decision-evidence.json` holds the researched fact shown under **Why it matters**
after each decision, plus the sources behind those facts. The game imports this
file directly (see `src/game/evidence.ts`), so editing it changes the game.

## Format

- `sources`: one entry per source page, keyed by a short id
  (`publisher`, `title`, `year`, `url` (https), `accessed` date). Reuse an
  existing source when several facts come from the same page.
- `evidence`: one entry per decision option, keyed by the option `id` from
  `src/game/scenarios.ts` (for example `shower-quick`).
  - `fact`: one short sentence or two, at most 180 characters, for a teen reader.
  - `sourceId`: a key from `sources`.
  - `status`: `draft` until a teammate checks the fact against the source,
    then `reviewed`. Status is for the team only; players see the fact either way.
  - `notes`: the supporting quote and where it is on the page; reviewer
    initials once reviewed. Never shown to players.

## Rules

- State only what the source states. Keep its numbers and units; never invent
  or estimate a figure.
- Prefer government agencies, intergovernmental bodies, peer-reviewed research
  and established research organisations.
- If a comparison depends on context (electricity mix, product type), say so.
- If research contradicts a game point value, do not change the value here;
  raise it with the team.

## Checking your changes

Run `npm test`. The evidence tests fail on unknown option ids, missing sources,
non-https links, long facts and unused sources, and print how many options
have a fact so far.
