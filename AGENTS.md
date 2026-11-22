# AGENTS.md

Working rules for this repo. The card is public and installed through HACS, but it is in
development: versions stay below 1.0 and options may still change.

## Environment

- Node 24 (`.nvmrc`) and pnpm (`packageManager` in `package.json`). Never use npm or yarn
  to install; dependencies go in `package.json` and `pnpm-lock.yaml`.
- The toolchain follows [Home Assistant's frontend](https://github.com/home-assistant/frontend)
  on purpose, so its code and conventions can be read and borrowed directly: Lit 3,
  TypeScript, rspack, Vitest, ESLint, Prettier and lit-analyzer. Where a config file
  differs from theirs it is a subset of theirs; say why in a comment when adding to it.
- Windows dev machine. Run everything through `pnpm run <script>`; the scripts in
  `package.json` are the index of what can be run.

## What is where

- `src/comfortmeter-card.ts`: the custom element and the card registration.
- `src/config.ts`: the card's YAML options and their validation.
- `src/home-assistant.ts`: the slice of Home Assistant's `hass` object the card reads.
  Home Assistant does not publish frontend types, so declare only what is used.
- `test/`: Vitest. Geometry and config logic are tested here as plain functions; keep
  them out of the element so they can be.
- `preview/`: the preview page (`pnpm run preview`, http://localhost:5181), the card
  beside a thermostat stand-in in light and dark. `preview/scenarios.ts` holds what it
  draws: the looks and the edge cases (missing, broken and extreme sensors, configurations
  at odds). Each edge-case card combines variations that don't affect each other; add to
  one for anything a sensor has really sent. `test/scenarios.test.ts` mounts every one and checks it draws no NaN and no stray "undefined" text.
- `documents/design/`: how the card looks and why. `documents/research/`: findings with
  their sources.

## Copy the design language, not the components

Home Assistant's own elements (`ha-control-circular-slider`, `ha-big-number`,
`ha-state-control-climate-temperature`) are internal: they only exist once the frontend
has loaded them for its own use. Never import them or rely on them being registered.
Re-draw what the card needs in its own SVG and Lit, using Home Assistant's numbers and
theme variables ([the design note](documents/design/home-assistant-design-language.md)).
`ha-card` is the exception: it is always registered and every card uses it.

## Quality gates

Before committing, all must pass:

```bash
pnpm run lint
pnpm test
pnpm run build
```

CI runs the same on every push and pull request, plus HACS validation and `pnpm audit`.

## Releases

Releases are hand-started. Set `package.json`'s version, move the **Unreleased** notes in
`CHANGELOG.md` under that version, commit, then run the **Release** workflow with the
version. Releasing is Daan's call: propose it, never start it unasked. A 0.x minor may
break options; a breaking change is listed under **Breaking changes** in the changelog.

## Conventions

- Use the terms in [CONTEXT.md](CONTEXT.md) exactly, in code, docs and commits.
- Card options are snake_case in YAML, as in Home Assistant's own cards.
- Errors from `setConfig` name the option, because Home Assistant shows them in the editor.
- No `console` output in the shipped card.
- `CHANGELOG.md` is written for people using the card, not for developers.

## Git

- `main` is the only long-lived branch. Daan's own work goes straight to `main`; outside
  contributions come in as pull requests against `main`.
- The remote is public: never commit secrets, Home Assistant URLs or tokens, or entity
  names from a real house beyond generic examples.
