# Design

Runtime art for the prototype is in `public/assets/`, where Vite serves it
unchanged. Concept boards and this inventory stay in `design/` because they
are not part of the running game.

## Runtime (`public/assets/`)

- `backgrounds/` — full-screen scenes: `morning.png`, `afternoon.png`, `evening.png` (1672×941, no UI text baked in).
- `ui/` — `ui_components_sheet.png`, a transparent sheet of panels, dialogue and decision cards, buttons, tabs, and meters.
- `icons/` — `resource_action_icons_sheet.png`, a transparent resource and action icon sheet.
- `characters/` — `student_and_supporting_portraits_sheet.png`, six student expressions and three supporting characters.
- `props/` — `scenario_props_sheet.png`, scenario objects such as the shower, bottle, bike, bus, food, bins, dishes, and laundry.
- `effects/` — `animation_elements_sheet.png`, frame concepts for arrows, sparkles, rain, steam, popups, confirmation, and leaves.

## Reference only (`design/`)

- `references/` — inspirational design boards (`ui_kit_concept.png`, `environment_direction_concept.png`). These are not runtime sprites.
- `asset_manifest.json` — filenames, resolutions, and format information. Paths point at the current file locations.

The UI, icon, portrait, prop, and effect PNGs are multi-item sprite sheets. Slice or map regions before using them as separate elements.

Use the game design document for rules, text, and values. Carbon, water, and waste are abstract impact points. Render interactive text and resource numbers in code so the panels stay reusable.

Every third-party asset must document its source and usage rights before it is added. Prefer a nearby attribution or asset record that identifies the license and any required credit.
