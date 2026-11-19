# One-Day Serious Game | Team Game Design Document

Version 1.1 • November 17, 2026 • Implementation-ready working baseline

**Design priority:** Build and playtest one complete day. The optional seven-day design is isolated in the final section and is not part of the initial scope.

## Document status and how to use it

This specification consolidates the team’s refined design decisions. “Confirmed” means agreed direction; “Provisional” means a recommended implementation default to approve or tune during development; “Future” means explicitly outside the one-day MVP. It is intentionally self-contained for programming, art/UI, educational content, and playtest work.

| **Status** | **Meaning** |
|----|----|
| Confirmed | One-day MVP; fixed personal goals; \$25 start; optional \$5 chore; money, energy, and time as constraints; carbon, water, and waste as metrics; free school lunch/family dinner; separate personal and environmental reporting. |
| Provisional | Precise timing calculation, energy caps/costs, score messaging, source-supported impact points, and event-specific eligibility rules. |
| Future | Seven-day persistence and weekly results, new scenes, multiple characters, additional jobs, achievements, leaderboards, and explorative movement. |

## 1. Game vision and audience

Elevator pitch: Play through a student’s ordinary day, meet responsibilities, manage limited money/energy/time, and see how everyday choices affect carbon, water, and waste impact. There are no universally “perfect” answers: real-world constraints matter.

| **Item** | **Specification** |
|----|----|
| Genre | Educational serious game; decision-based daily-life simulation |
| Mode | Single-player; one full simulated day |
| Intended audience | Students/young adults (provisional primary audience; validate in playtest) |
| Platform | Desktop browser; React + TypeScript + Vite, with plain CSS |
| Perspective | Student protagonist; named/customizable identity not required |
| Duration | Target 10–15 minutes per first run (provisional test target, not a guaranteed runtime) |
| Tone | Warm, realistic, nonjudgmental, thoughtful; avoid guilt or moralizing |
| Learning goal | Recognize environmental impacts and make practical sustainability decisions amid personal constraints |

## 2. Scope and non-goals 

### 2.1 In scope

- Start/instructions screen; a clear overview of three personal goals and resource meanings.

- A single ordered day of decision events and optional conditional follow-ups.

- Money, Energy, Time, Carbon (C), Water (W), and Waste (R), with consistent updates and bounds.

- Three automatically evaluated personal goals; no instant game-over on failure.

- Optional earning chore; free essential alternatives; insufficient-money handling.

- Short educational feedback after decisions; end-of-day personal and environmental reports.

- Restart/replay to compare alternate choices; basic accessibility and testability.

### 2.2 Out of scope for first playable build

Seven-day content, save files/accounts, multi-character campaign, free-roaming 2D movement, weather generation, random event generator, online features, leaderboards, procedurally generated choices, real-time clock pressure, AI-generated gameplay, and scientific precision beyond validated source claims.

## 3. Player experience and core loop

1.  Read the situation, available options, current Money/Energy/Time, and personal goals.

2.  Select an action; choices may consume money/time/energy or alter C/W/R metrics.

3.  Receive concise feedback explaining both the mechanical consequence and environmental reasoning.

4.  Advance to the next scheduled event or an explicitly triggered follow-up.

5.  At goal checkpoints, update status: active, achieved, or missed.

6.  At 10:00 PM, review outcomes and optionally restart to improve or experiment.

**Critical rule:** The player always reaches an end-of-day report, even after missed goals, poor spending, or high environmental impact.

## 4. State model and economy

| **Variable** | **Start / limits** | **Behavior and role** |
|----|----|----|
| Money (\$) | \$25; floor \$0 | Player-controlled budget; purchases require sufficient funds; no debt; available funds change immediately. |
| Energy | 70; proposed range 0–100 | Capacity/effort resource; options may add or subtract Energy. No one-day overnight recovery needed. |
| Time | 7:00 AM to 10:00 PM | Simulated event-based clock, not real-time. Choices may introduce delays; deadlines use calculated arrival/trigger values. |
| Carbon (C) | 0 C | Non-spendable environmental impact points; increases from selected choices; lower total means lower modeled impact. |
| Water (W) | 0 W | Non-spendable water impact points; tracked in daily results; lower total means lower modeled impact. |
| Waste (R) | 0 R | Non-spendable impact points for material use, disposal and recycling contamination; lower total indicates lower modeled impact. R is a game abstraction, not kilograms of trash. |

### 4.1 Rules and guardrails

- Money never falls below \$0. Any unaffordable paid option is visibly disabled with a reason; at least one essential free alternative remains.

- Energy is clamped between 0 and 100. For the MVP, insufficient-energy options may be disabled, but the day must still be completable.

- Carbon, Water, and Waste do not buy, unlock, or block options. They are outcome metrics, not penalties automatically converted into game currency.

- All player-facing C/W/R numbers are game impact points, not kilograms of CO₂ or liters of water. They must not be labeled as real measurements.

- Lunch is provided at school and dinner at home, free to the student. Breakfast and optional snacks/drinks can cost money.

- Household chores are optional: decline without penalty to money, or accept to earn \$5 with the task’s time/energy and environmental costs.

### 4.2 Energy default proposed for implementation

Use an Energy ceiling of 100 and a floor of 0. Keep the authored energy effects for choices already defined. For choices without energy changes, default to 0 until the team explicitly balances them. Do not silently invent energy penalties for food types or sustainable actions. One-day mode does not need overnight recovery; +30 overnight is reserved as a possible future seven-day default.

## 5. Personal goals and outcome logic

| **Goal** | **Evaluated at** | **Success condition** | **On failure** |
|----|----|----|----|
| Test punctuality | School arrival, 8:00 AM deadline | Arrival time ≤ 8:00 AM | Mark missed; continue day. |
| Practice readiness | 3:00 PM checkpoint | Energy ≥ 20 at 3:00 PM | Mark missed; continue day. |
| Gift savings | End-of-day report | Money ≥ \$12 at 10:00 PM | Mark missed; continue day. |

All goals are visible from the opening screen and accessible throughout the day. Use three statuses: ACTIVE (deadline not reached), COMPLETED, and MISSED. A goal is evaluated once at its checkpoint and is not retroactively changed by later actions. Display “X of 3 goals completed,” but do not combine the goal count with C/W into one arbitrary overall grade.

**Gift goal adaptation** For the one-day version, saving \$12 is checked at the end of this same day. It is not a Friday objective.

## 6. Daily structure and event chronology

| **Time** | **Event** | **Decision focus** |
|----|----|----|
| 7:00 AM | Shower | Time vs water/energy use; lateness flag |
| 7:25 AM | Brush teeth | Tap off vs running |
| 7:30 AM | Breakfast | Buy vs pack vs skip; possible bag choice |
| 7:40 AM | Commute | Arrival at school by 8:00 AM |
| 8:00 AM | Test checkpoint | Evaluate arrival goal |
| 12:00 PM | Lunch | Food impact, not purchase price |
| 12:20 PM | Waste cleanup | Recycle, trash, sort |
| 1:00 PM | Bathroom | Drying methods |
| 2:00 PM | Hydration | Bought drink vs reusable refill |
| 3:00 PM | Practice checkpoint | Evaluate Energy ≥ 20 |
| 5:00 PM | Mall with friends | Shopping/social pressure; cup disposal follow-up |
| 6:00 PM | Travel home in rain | Transport/ride-share split; idling follow-up |
| 7:00 PM | Dinner | Meal environmental impact |
| 7:45 PM | Optional dishes chore | Accept to earn \$5; pick washing method |
| 8:30 PM | Laundry | Cold vs hot wash |
| 9:30 PM | Before-bed choice | Heat vs phone charger |
| 10:00 PM | Recap | Three goals; environmental totals; trade-offs |

### 6.1 Deterministic time rule for MVP (provisional)

Use authored event anchors to keep the story manageable. Scenario durations represent time spent, while a lightweight morning delay accumulator determines whether the player reaches the test. Proposed implementation: the quick 5-minute shower is the reference morning routine (0 additional delay); a 20-minute shower adds +15 minutes of delay; skipping the shower saves 5 minutes (-5), if used. Packing breakfast adds +10 minutes relative to buying or skipping. Commute options use their authored reference arrival times (7:45, 7:58, 7:55, 7:50) plus the accumulated morning delay. This must be disclosed to players via predicted arrival/late warnings where appropriate.

Example: quick shower + bus arrives 7:58 (goal met); long shower + bus arrives 8:13 (goal missed); long shower + ride-share arrives 8:00 (goal met). This approach resolves ambiguous overlapping schedule labels without needing a fully simulated continuously advancing timetable.

Outside morning punctuality, advance to the next fixed event after the current choice; record activity durations for feedback and future balancing. Do not allow the player to miss an unrelated scheduled event because of unmodeled time arithmetic. Later versions can implement full time-budget simulation if desired.

## 7. Decision catalog: authored options and effects

Values below are the working gameplay-point values for the first prototype. “—” means no explicit effect has been assigned; implement as zero unless the team approves a new effect. A number shown as +C or +W is a relative impact point. Do not infer scientific units.

| **Scenario** | **Option** | **Mechanical impact / condition** |
|----|----|----|
| 01 Shower · 7:00 | Long hot shower | +20 min; Energy +15; W+6; C+2; running-late modifier +15 |
|  | Quick shower | +5 min; Energy +5; W+2; C+1; default modifier 0 |
|  | Skip shower | Energy -10; proposed morning modifier -5 |
| 02 Brush teeth · 7:25 | Leave tap running | W+1 (was W+3; Rev 1.2) |
|  | Turn tap off | W+0 |
| 03 Breakfast · 7:30 | Buy snack + bottled drink | Money -\$4; Energy +10; C+2; R+1 (single-use drink packaging); trigger bag choice |
|  | Pack breakfast + reusable bottle | +10 min; Energy +10; C+0; R+0 (existing reusable); unlock refill later |
|  | Skip breakfast | Energy -15 |
| 03b Bag (conditional) | Plastic bag | C+1; R+2 (single-use bag) |
|  | Paper bag | C+2; R+2 (single-use bag; recyclable only if accepted/clean) |
|  | Buy reusable tote | Money -\$2; C+3; R+2 (new item produced today; potential lifetime benefit not represented in one day) |
|  | Use backpack | C+0; R+0 (already owned) |
| 04 School commute · 7:40 | Ride-share | Money -\$8; base arrival 7:45; C+8 |
|  | Bus | Money -\$3; base arrival 7:58; C+2 |
|  | Bike | Energy -20; base arrival 7:55; C+0 |
|  | Dad driving same way | base arrival 7:50; C+1; availability needs narrative justification |
| 05 Lunch · 12:00 | Local beef burger | Money \$0; C+10 |
|  | Chicken sandwich | Money \$0; C+2 (was C+3; Rev 1.2) |
|  | Bean burrito (imported ingredients) | Money \$0; C+1 |
| 06 Cleanup · 12:20 | Put everything in recycling | R+3 (contaminates recycling; plastics/food unsuitable in mixed recycling); no additional C assigned pending research |
|  | Throw everything in trash | R+2 (recoverable material discarded); no additional C assigned pending research |
|  | Sort correctly | +5 min; R+0; no additional C assigned pending research; follow local disposal rules |
| 07 Bathroom · 1:00 | Paper towels | C+2 (working baseline); R+1 (single-use paper) |
|  | Older warm-air dryer | C+2 |
|  | High-speed dryer | C+1 |
| 08 Drink · 2:00 | Plastic water bottle | Money -\$2; C+1; R+1 (new single-use bottle) |
|  | Juice in glass bottle | Money -\$3.50; Energy +5; C+2; R+1 (container used; disposal route unspecified) |
|  | Refill reusable bottle | C+0; R+0; only if packed earlier |
| 09 Mall · 5:00 | Buy new hoodie | Money -\$10; Energy +15; C+6 (production/materials/transport); R+3 (new material consumption) |
|  | Buy thrifted hoodie | Money -\$12; Energy +10; C+1 (resale handling/transport model); R+1 (reuse has reduced new-material demand) |
|  | Buy nothing | Energy -5; C+0; R+0 (game emotional abstraction; not universal) |
| 09b Cup disposal (follow-up) | Recycling bin | R+2 (compostable cup typically not accepted in conventional recycling; actual rules vary); no additional C assigned |
|  | Trash | R+1 (disposal; appropriate fallback if composting unavailable); no additional C assigned |
| 10 Travel home · 6:00 | Ride-share alone | Money -\$8; C+8 |
|  | Split ride-share with 3 friends | Money -\$2; C+2 |
|  | Bus | Money -\$3; +25 min; C+2 |
|  | Walk in rain | Energy -20; C+0 |
|  | Ask Mom for ride | C+8 (was C+2; Rev 1.2); trigger idling choice |
| 10b Engine idling (conditional) | Agree to leave engine running | C+1 |
|  | Ask Mom to turn engine off | C+0 |
| 11 Dinner · 7:00 | Beef tacos | Money \$0; C+10 |
|  | Chicken stir-fry | Money \$0; C+2 (was C+3; Rev 1.2) |
|  | Veggie pasta | Money \$0; C+1 |
| 12 Chore · 7:45 | Decline dishes chore | Money +\$0; do not open method choice |
|  | Accept chore | Money +\$5 on completion; open dishwashing method choice |
| 12b Dishwashing method | Hand wash with tap running | +20 min; W+6; C+2 |
|  | Rinse plates then dishwasher | +10 min; W+4 |
|  | Run half-full dishwasher | +5 min; W+2 |
|  | Wait until dishwasher full | +5 min; W+1 |
| 13 Laundry · 8:30 | Hot wash | C+4 |
|  | Cold wash | C+1 |
| 14 Before bed · 9:30 | Unplug charger; keep heat up | C+4 |
|  | Lower heat a few degrees | Energy -5; C+0 |

### 7.1 Essential clarifications before shipping

- The 3b bag choice appears only after purchased breakfast. The reusable refill appears only after packing the bottle earlier. The idling choice appears only after Mom’s pickup.

- The mall “compostable” cup follow-up currently appears as a narrative event: explicitly explain that the player finished a smoothie; its purchase cost is not assigned and should not be quietly charged.

- Dishwashing rewards are paid only after completing the chore. Under the current rules, waiting for a full dishwasher still counts as completing the assigned scraping/loading task and earns \$5.

- The original dishwashing options do not define Carbon for all methods; treat absent values as zero game points temporarily, and mark them for research/balancing review rather than claiming physical zero impact.

- The “buy nothing” mall option should not force a purchase or block future progression. The emotional -5 Energy is a game abstraction; avoid implying it is universal.

- Do not create new cost/energy penalties solely to make an option less attractive. Flag ambiguous or unbalanced values for playtest adjustments.

## 8. Conditional event and eligibility rules

| **Flag / check** | **When set** | **Effect** |
|----|----|----|
| hasReusableBottle | Player packs breakfast and bottle | Enable water refill at 2:00 PM |
| bagChoicePending | Player buys breakfast at store | Open bag follow-up immediately |
| morningDelayMinutes | Shower and breakfast morning selections | Add to reference arrival time for commute |
| schoolArrival | After commute selection | Evaluate 8:00 test goal |
| practiceReady | At 3:00 PM, Energy ≥ 20 | Evaluate practice goal once |
| momPickup | Player requests ride from Mom | Open engine-idling follow-up |
| choreAccepted | Player accepts dishes | Open method selection; +\$5 upon completion |
| giftGoalMet | At 10:00 PM, Money ≥ \$12 | Evaluate gift goal |

Eligibility is evaluated before options are shown; unaffordable choices are disabled rather than silently allowed. State changes and educational feedback should occur once per accepted choice, not once per screen render. Follow-up events must not duplicate the parent option’s effect.

## 9. Player feedback and educational content

After each choice, show (a) plain-language outcome, (b) explicit variable changes, and (c) one short “why it matters” explanation. Avoid green = correct / red = wrong language. Where a comparison is context-dependent, say so.

| **Decision** | **Illustrative feedback (copy can be refined)** |
|----|----|
| Pack breakfast | “You spent extra preparation time but avoided the store purchase and brought a refillable bottle for later.” |
| Take bus | “You saved money compared with a ride-share. Check whether the morning delay still gets you to the test on time.” |
| Imported bean meal | “Production methods and food type can matter more than transportation distance alone. This simplified score will be checked against credible sources.” |
| Decline chore | “You kept your evening free but did not earn the optional \$5.” |
| Sort waste | “Separating materials avoids contaminating recycling; local disposal rules vary.” |

Content rule: attach a source or research note to each explanatory claim, especially carbon comparisons, water use, drying methods, and compostable packaging. If research contradicts a point value, update the value and note the revision; do not present speculative C/W/R points as measured science.

## 10. End-of-day reporting and replay

1.  Personal goals: three cards with achieved/missed status and one-sentence explanations.

2.  Environmental summary: total Carbon points, total Water points, and total Waste points shown separately, with no unvalidated conversion to physical units.

3.  Decision highlights: 2–3 biggest modeled contributors to C/W and 1–2 helpful trade-offs the player made.

4.  Economy: money remaining, income earned from optional chores, and selected costs; optional starting-versus-ending Energy.

5.  Reflection: short neutral takeaway and an invitation to replay using a different strategy.

Do not imply that 3/3 personal goals automatically means a sustainable day, or that low C/W guarantees meeting life goals. Replay resets all state and goals; any comparison to a previous run may be held in memory for the current session but is not required.

## 11. UI, controls, visual and accessibility direction

Visual approach: static illustrated 2D scenes or simple panels with consistent location backgrounds; no movement controller required. Use a clean, approachable interface with a restrained green/blue palette for informational cues; avoid relying on color alone.

- Persistent top bar: time, money, energy; compact C/W indicators or an accessible impact panel.

- Goal drawer/panel: all three goals, requirements, deadlines, and status.

- Decision card: short scenario text, 2–5 options, exact money/energy/time consequences where known; no need to reveal environmental point effects before choosing if learning-by-discovery is preferred, but avoid unfair hidden affordability rules.

- Feedback panel: result and explanation plus a clear Continue action; backtracking past committed actions disabled for simple MVP consistency.

- Interaction: mouse/touch plus keyboard navigation; visible focus outlines, readable text, high contrast, labels/icons together, no mandatory sound, non-timed reading.

- UI states: loading, option disabled with reason, success/failure indicators, and end-of-day restart button.

## 12. Implementation architecture (engine-neutral)

Recommended architecture separates authored scenario data from game rules and presentation. This lets one teammate research/edit decisions without changing state management, while others implement the UI and narrative.

Tech stack: React + TypeScript + Vite; plain CSS for styling and animations; React useReducer for game state; Vitest for game logic testing; no backend, database, or dedicated game engine.

| Module | Responsibility |
|----|----|
| GameState | Money, Energy, clock, C, W, R, flags, goal statuses, history; initialized once per run. |
| ScenarioData | Ordered events, options, authored effects, prerequisites, feedback keys. |
| RulesEngine | Validate affordability/prerequisites, apply clamped effects, compute morning arrival, evaluate checkpoints. |
| EventFlow | Advance event index, insert conditional follow-ups, avoid duplicate choice application. |
| ReportBuilder | Aggregate totals and highlights from decisions; create end-of-day summary. |
| UI Layer | Scene, choices, status bar, goal display, feedback, recap, restart. |
| Content/Research | Educational explanations, references, sensitivity check, point-value revisions. |

### 12.1 Suggested core data structures

A compact schema is sufficient: GameState {money, energy, timeMinutes, carbonPoints, waterPoints, wastePoints, flags, goals, history}; Scenario {id, scheduledTime, prompt, options}; Option {id, label, cost, energyDelta, carbonDelta, waterDelta, wasteDelta, durationMinutes, conditions, effects, feedback}; Goal {id, deadline, check, status}. Use stable IDs and pure state-update functions wherever practical.

### 12.2 State transition pseudocode

1.  Player selects eligible option → recheck money and prerequisites.

2.  Apply monetary and energy changes with bounds; add C/W/R points; set flags.

3.  Append decision record including event, option, before/after state, and brief feedback.

4.  Evaluate a checkpoint when reached (test arrival, 3:00 Energy, end-of-day savings).

5.  If the option triggers follow-up, display it once; otherwise advance to next scheduled event.

6.  At 10:00 PM generate report; Restart creates fresh initial state.

## 13. Team collaboration and development plan

For a six-person student team, assign clear primary owners while allowing code review and shared playtesting. These roles are suggested and can be adapted to member strengths.

| **Workstream** | **Primary deliverable** |
|----|----|
| Project/integration | Repository setup; issue board; merge/integration checklist; executable build |
| Core rules | GameState, option validation, scoring, goals, time and conditional events |
| Scenario/content | Data entry for all scenarios; accurate explanations; research references |
| UI/UX | Status bar, option cards, goals, feedback, results, accessibility |
| Visual/assets | Scene styling, iconography, consistent backgrounds, responsive layouts |
| QA/documentation | Test matrix, playtest guide, defect log, GDD updates, release checklist |

Git workflow: feature branches, focused pull requests, at least one review when practical, no direct unreviewed changes to main, and a brief smoke test before merging. Use the agreed React + TypeScript + Vite stack.

## 14. Acceptance tests and playtest plan

| **Test** | **Expected behavior** |
|----|----|
| Budget floor | With \<\$8, ride-share option is disabled; free alternatives remain usable. |
| Morning lateness | Quick shower + bus reaches 7:58; long shower + bus reaches 8:13. |
| Arrival boundary | Exactly 8:00 AM meets the test goal; 8:01 AM does not. |
| Energy goal | At 3:00 PM Energy 20 is success, 19 is missed. |
| Gift goal | At 10:00 PM \$12 is success, \$11.99 is missed. |
| Conditional refill | Refill unavailable unless reusable bottle was packed. |
| Conditional follow-ups | Bag, idling, and dishwashing method choices occur only after their parent action. |
| Chore payout | Declining pays \$0; accepting and completing pays exactly \$5 once. |
| Metric separation | C, W, and R totals display separately; neither is deducted as currency. |
| Failure continuity | Missing any/all goals never blocks the day-ending report. |
| Restart | All resources, flags, decision history, and goal statuses reset. |

### 14.1 Playtest questions

- Can a new player understand all three personal goals without team explanation?

- Do players know why a choice is disabled and how to continue?

- Are the time trade-offs legible, especially the test arrival calculation?

- Do players understand the difference between personal success and environmental impact?

- Which choice feels obvious or repetitive; which feels meaningful?

- Do players understand that C/W are simplified impact points rather than exact emissions or water volumes?

- Can an unassisted player finish the full day in a reasonable session?

### 14.2 Definition of done for initial playable prototype

A new player can start, make decisions, encounter the required conditional events, see correctly updated resources, meet or miss each of the three goals, reach the final report, and restart. The build is accessible on the agreed platform, survives normal click paths, and has been tested by someone outside the implementation team.

## 15. Decisions requiring team sign-off before coding

| **Question** | **Recommended default** | **Why it matters** |
|----|----|----|
| Technical format | React + TypeScript + Vite; plain CSS; React useReducer; Vitest; no backend, database, or dedicated game engine | Browser-based choice game with lightweight client-side state and testable logic |
| Time calculation | Reference arrival + explicit morning delay | Makes morning outcome deterministic and testable |
| Energy range | 0–100; start 70 | Provides bounded resource model |
| Unavailable Energy | Disable if insufficient; preserve progress alternatives | Avoid confusing negative balances / soft-locks |
| Optional chore energy cost | No extra penalty until approved | Avoid inventing values |
| Unassigned C/W cells | Temporary 0 gameplay points, marked for research | Prevents fabricated scientific claims |
| Mall cup follow-up | Fixed narrative follow-up; no unlisted charge | Preserves authored sequence without accidental budget effects |
| Primary audience | Students / young adults | Guides reading level and UI testing |

**Priority** Approve the time calculation, energy restrictions, and any missing effects in a 15-minute team review. Everything else can be refined from observed playtest problems.

## APPENDIX A — OPTIONAL SEVEN-DAY EXPANSION (NOT MVP)

This appendix is a future design path only. Do not implement it until the one-day experience is complete, tested, and stable. It does not modify any one-day rules or deadlines.

### A.1 Weekly premise and schedule

The expanded experience spans a fixed Monday–Sunday week with a limited set of contextual events. Reuse the same decision engine and many existing scenarios, but vary circumstances rather than repeating every exact prompt all seven days. Monday–Friday center on school; weekends can feature lighter family/community routines.

| **Day** | **Illustrative emphasis** | **Potential conditional variation** |
|----|----|----|
| Monday | Introduce routines and personal priorities | Reusable bottle decision affects later refill |
| Tuesday | School commute and household responsibility | Extra chore competes with study time |
| Wednesday | Midweek habits | Rain or travel delay complicates commute |
| Thursday | Consumption and waste | Reuse/repair situation replaces a repeated purchase |
| Friday | Friend’s gift deadline | Check gift fund at scheduled deadline |
| Saturday | Household/optional weekend activity | Optional work shift only if time allows to build |
| Sunday | Home energy and reflection | Prepare for next week; weekly recap |

### A.2 Persistent economy and recovery

Money carries across all days. Keep a \$25 starting balance and optional \$5 household-chores earning opportunities as initial assumptions, then rebalance based on week-long affordability tests. Weekly maximum earning would be \$35 if seven \$5 chores are made available and all are completed; this is not a guarantee of income. Costs remain meaningful, and free essential alternatives prevent soft-locks. Energy partially recovers overnight (proposed +30, capped at 100). Time advances to the next day’s opening event. Goal states persist in a weekly log.

### A.3 Environmental accounting and goals

Each day starts with new daily C/W counters while cumulative weekly totals retain previous days’ impact. Display daily recaps and one final weekly report with separate total Carbon, Water, and Waste points, budget trends, personal goal outcomes, and recurring habits. A multi-day gift objective may be due Friday rather than at the end of each day. Avoid converting accumulated points into real-world emissions without validated research.

### A.4 Design principles for the expansion

- Only add conditional events if they visibly depend on an earlier decision or make a repeated scenario meaningfully different.

- Re-use scene components, scoring rules, and option data instead of hand-building seven independent games.

- Keep fixed event times readable and avoid seven repetitions of every minor decision; consider fewer decisions per day.

- Use cost/time/energy constraints for genuine choice tension, not arbitrary penalties for plant-based meals or “good” behavior.

- Test the total playtime and economy through multiple complete runs before adding a second character or large environments.

### A.5 Expansion go/no-go checklist

Proceed only when the one-day build is stable; learning objectives are clear from playtests; the team has spare implementation time; the next-day state transition is tested; and a full seven-day run remains reasonably paced. Otherwise ship the complete one-day game.

## Revision 1.1 — approved MVP metrics and scoring

Decision status: Approved for initial prototype (November 17, 2026). This section supersedes earlier references to C/W-only metrics and provisional environmental scoring. Preserve the one-day storyline, personal goals, economy, conditional events, and authored time rule.

### Environmental impact accounting

- Carbon (C): climate-related impacts from energy, transport, food production, and manufacture. Keep accumulated impact points (lower is better). A carbon effect may coexist with a Waste effect only when two distinct mechanisms are being represented.

- Water (W): resource use from showers, taps, dishwashing and similar activities. Accumulate W impact points (lower is better).

- Waste (R): material consumption, avoidable single-use products, and disposal/contamination impacts. Accumulate R impact points (lower is better). A reused existing item generally receives R+0; a newly purchased reusable item may still have upfront production impacts.

- Money, Energy, and simulated Time are constraints, not environmental impact categories. Do not introduce an Energy environmental category or Biodiversity category in the one-day MVP.

- Default-Zero Rule (from the Master Design Doc team notes): only explicitly specified variables change; other deltas are zero for game logic and mean “not modeled,” not “physically zero impact.” Every new R score in the table is a provisional design value requiring team balancing and source review.

- A choice need not affect all metrics. Do not retrofit arbitrary consequences simply to fill cells. Keep each explanation tied to a mechanism, and distinguish environmental reality from illustrative game points.

### Time pressure and player decision timer

Do not add a real-time countdown in the prototype. Keep the existing anchored, event-based clock and morning delay calculation. Players may read and choose at their own pace; a slow real-world response does not alter simulated Time. This matches the team notes preference for event-based time as the simplest implementation and the MVP accessibility requirement for non-timed reading.

### End-of-day Eco Score (provisional calculation)

Show raw C, W and R totals separately and keep the 3 personal goal outcomes separate. For the optional combined Eco Score, normalize each category to 0–100 using the minimum and maximum achievable totals across complete, valid one-day paths (honoring eligibility, prerequisites and affordability): MetricScore = 100 × (MaximumAchievableImpact − PlayerImpact) / (MaximumAchievableImpact − MinimumAchievableImpact). Higher is better. Clamp to 0–100 and round only for display.

Eco Score = arithmetic mean of the available normalized C, W and R scores (equal weights). If a category has no variation between valid runs, label it “not comparable” and omit it from that mean. Compute achievable bounds offline from the complete decision tree after point balancing, not by naively summing the highest/lowest option per event. If bounds have not been verified in time for playtest, display the three raw impact totals without a combined grade; do not invent scientific units.

Example: C score 80, W score 60 and R score 70 → Eco Score 70/100. This is a relative game score, not a certified measure of environmental sustainability. Personal goal completion is reported beside, never included in, the Eco Score.

### Decision catalog review notes: reasoning and exceptions

**Shower / brush teeth / dishes:** Hot-water use can require energy (carbon) while water flowing increases Water impact. Keep W scoring primary for taps and washing; method-specific C values that are currently blank remain unmodeled until researched.

**Breakfast and drink packaging:** Making and shipping food/drink packaging requires energy and materials; disposal creates waste. A reusable bottle already owned reduces reliance on new containers. Breakfast C+2 remains the existing game baseline; the added R values distinguish packaging.

**Checkout bag:** A paper, plastic or reusable bag has a production footprint. An already-owned backpack generally avoids manufacturing an additional bag. A newly bought tote has upfront environmental impacts; repeated use over many trips can offset alternatives, but this one-day game does not assume those future uses.

**Commutes and idling:** Fuel combustion produces greenhouse gases. The player is modeled as sharing transit emissions with other passengers; walking/biking are lower direct-emission options. A preexisting car trip may have lower marginal impact than arranging an extra car trip. Idling burns fuel without moving.

**Lunch and dinner:** Livestock feed, land use, methane, fertilizers, cooking, and supply chains can all contribute to emissions. Beef often has higher climate impact than legumes, even when the latter travel farther. Exact C values are simplified relative comparisons, not measured CO₂.

**Recycling and compostable cup:** Incorrectly putting food-soiled packaging or nonaccepted compostable products in recycling can contaminate recycling. A “compostable” label does not mean a local recycling bin accepts it; some products require industrial composting. Disposal mainly maps to R for this prototype, not an invented carbon number.

**Hand drying:** Paper towels have manufacturing/disposal impacts, dryers use electricity, and relative carbon ranking depends on electricity source, type and usage. Keep the existing C values provisional; paper-towel R+1 represents a disposable item.

**New vs thrifted hoodie:** A new hoodie involves fiber production, yarn and fabric processing, dyeing, sewing, packaging and shipping, which use energy and can emit greenhouse gases. Thrifting typically avoids the need to produce another new garment, though secondhand handling and travel still have impacts. C+6 vs C+1 are game relative points; R additionally measures new material consumption, not literal garment trash generated at purchase.

**Laundry / home heat / charger:** Heating wash water and heating rooms often require much more energy than an idle phone charger. Energy source affects carbon emissions; washing on cold or lowering heat can reduce modeled C. This is the intended trade-off, not a claim that charging has absolutely zero impact.

**Avoided purchase vs social pressure:** Buying nothing has C+0/R+0 for the particular modeled purchase. Energy −5 is a narrative emotional choice, not a universal psychological prediction; present neutrally.

### Team research and balancing checkpoints

- Check local recycling acceptance for greasy food containers, soft plastic bags and compostable cups; avoid universally claiming paper, glass or compostable packaging is automatically better.

- Validate direction and relative magnitude of clothing, hand-dryer, meals and transport comparisons with credible evidence. Do not label impact points as real kilograms, liters or grams.

- Check that the waste scale is neither dominated by a single shopping decision nor absent in most paths; rerun achievable-score bounds after any delta changes.

- Preserve the conditional logic: breakfast purchase → bag choice; packed bottle → refill; Mom pickup → idling; accepting and completing chore → exactly one \$5 payout.

- For the November 19 playtest, prioritize a functioning one-day experience and clear feedback over precision or a timed-decision system.

## Revision 1.2 — research-based point adjustments (proposed, pending team sign-off)

Date: November 19, 2026. Following the GDD section 9 rule ("If research contradicts a point value, update the value and note the revision"), these values changed after sourced facts were added in `docs/research/decision-evidence.json`. Points remain simplified game values, not measurements; the aim is the right order and rough proportion between options.

| **Option** | **Change** | **Evidence** | **Reasoning** |
|----|----|----|----|
| Leave tap running | W+3 → W+1 | EPA WaterSense: standard faucet 2.2 gal/min; standard showerhead 2.5 gal/min | A 2-minute brush with the tap running uses less water than a 5-minute shower (W+2), so it should score below it. |
| Chicken sandwich / chicken stir-fry | C+3 → C+2 | Our World in Data: beef about 60, poultry about 6, peas about 1 kg CO2eq per kg | Chicken sits much closer to plant-based meals than to beef. Beef C+10 and plant-based C+1 are unchanged. |
| Ask Mom for ride | C+2 → C+8 | EPA: typical passenger vehicle about 400 g CO2 per mile | Matches section 7's reasoning that an extra car trip arranged for the player costs more than a pre-existing one. It now equals a solo ride-share (C+8); idling still adds C+1. |

Achievable bounds after the change: Carbon 4–62 (was 4–56), Water 0–13 (was 0–15), Waste 1–13 (unchanged).

Reviewed and intentionally unchanged:

- **Bus (C+2) vs solo ride-share (C+8):** OWID's averages put a bus at about 57% of a petrol car per passenger-km, but the game models the player's marginal share of a bus that runs anyway (section 7 review notes). Kept as designed.
- **Bike and walk (C+0):** cycling has a small footprint (16–50 g CO2eq per km). Covered by the Default-Zero Rule ("not modeled", not "zero impact").
- **Cleanup carbon:** EPA estimates landfilled food causes about 58% of landfill methane, but disposal stays Waste-only per the section 7 notes, avoiding an invented carbon number. Open question for the team.

