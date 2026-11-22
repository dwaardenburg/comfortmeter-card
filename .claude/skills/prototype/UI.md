# UI Prototype

Generate **several radically different versions of the card** on one preview page, switchable from a floating bar. The user flips between variants in the browser, picks one (or steals bits from each), then throws the rest away.

If the question is about logic or geometry rather than what something looks like, this is the wrong branch. Use [LOGIC.md](LOGIC.md).

## When this is the right shape

- "Where should the needles pivot, and which side does each scale take?"
- "How should the comfort zone be drawn: hatched, filled, or outlined?"
- "What replaces the thermostat's big number and buttons?"
- Any time the user would otherwise pick between vague mockups in their head.

## Judge it in context

A card is easy to judge wrongly on its own. Every variant is rendered **beside Home Assistant's thermostat card look** and inside a dashboard-width column, in a light and a dark theme, so the question "does it sit naturally next to the thermostat card?" can actually be answered. Use realistic readings (21.5 °C and 48 %, not 0 and 100), plus one reading outside the comfort zone and one at the end of a scale.

## Process

### 1. State the question and pick N

Default to **3 variants**. More than 5 stops being radically different and starts being noise, so cap there.

Write the plan in one line at the top of `prototype/<question>/NOTES.md`:

> "Three ways to place the needles' pivots, switchable via `?variant=`."

### 2. Generate radically different variants

Each variant is its own Lit element (`variant-a`, `variant-b`, ...) in its own file, taking the same fake `hass` and config. Hold each one to:

- Home Assistant's design language: theme variables, the arc and stroke numbers in `documents/design/home-assistant-design-language.md`.
- **Structural difference**: different geometry, different hierarchy, different focal point — not different colours. If two come out too similar, redo one with an explicit "not like A" instruction.

### 3. Wire them together

One `index.html` in the prototype folder loads the variants and renders the one named by `?variant=` (default `A`), together with a stand-in for the thermostat card, in two columns: light theme and dark theme. Serve it with the dev server so it rebuilds on save; the run command goes in `NOTES.md`.

### 4. Build the floating switcher

A small fixed bar at the bottom centre:

- **Left and right arrows** cycle through the variants (wrapping round) and update `?variant=`, so a variant is shareable and survives a reload.
- **The label** shows the variant key and a short name: `B (pivots at the bottom)`.
- The `←` and `→` keys cycle too.
- It looks obviously not part of the design (a high-contrast pill).

The switcher lives only in the prototype folder, never in `src/`, so it cannot ship.

### 5. Hand it over

Open the page in the browser pane and give the user the URL and the variant keys. The interesting feedback is usually **"the pivots from B with the zone from C"**, which is the actual design.

### 6. Capture the answer and clean up

Once a variant has won, write which one and why into `NOTES.md`, then move the decision into `documents/design/`. Rebuild the winner properly in `src/` (with tests for its geometry), and delete the prototype folder; git history keeps the variants.

## Anti-patterns

- **Variants that differ only in colour or copy.** That's a tweak, not a prototype. Real variants disagree about structure.
- **Sharing too much code between variants.** A shared fake `hass` is fine; a shared dial defeats the point.
- **Judging a variant on its own.** Without the thermostat look beside it and both themes, every variant looks fine.
- **Promoting the prototype directly to production.** The variant code was written under prototype constraints. Rewrite it properly when you fold it in.
