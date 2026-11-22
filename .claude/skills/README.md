# Agent Skills

Skills for working in this repo, ported on 2026-11-22 from Daan's `home-assistant` repo,
which ported them from his `homepage` repo, which derived them from
[mattpocock/skills](https://github.com/mattpocock/skills).

**Local adaptations**: the issue tracker is GitHub Issues through `gh`
(`documents/agents/issue-tracker.md`, labels in `documents/agents/triage-labels.md`).
Commands are `pnpm run ...`, tests are Vitest, and the style gate is ESLint, Prettier, `tsc`
and lit-analyzer (`pnpm run lint`) instead of the Python scanners the `home-assistant`
repo has, so `style-audit` did not come over. The long-lived branch is `main`. The
prototype skill's UI branch is back to rendering variants in a browser, because this repo,
unlike `home-assistant`, is a web interface.

Both rules every skill here defers to come from `AGENTS.md`:

- **Card options are in users' dashboards.** No skill renames one to satisfy a lint rule,
  a refactor or a naming convention; a rename is a breaking change in the changelog.
- **Committing is not releasing.** Nothing reaches HACS users until the hand-started
  Release workflow runs, and that is Daan's call. `implement` ends at the commit.

Not ported, add them when needed: `wayfinder`, `improve-codebase-architecture`,
`research`, `handoff`, `resolving-merge-conflicts`.

## User-invoked

Reachable only when you type them.

- **[grill-with-docs](./grill-with-docs/SKILL.md)** — A grilling session that also maintains the domain model (`CONTEXT.md`, and ADRs once the design settles) as decisions land.
- **[to-spec](./to-spec/SKILL.md)** — Turn the current conversation into a spec and publish it as a GitHub issue.
- **[to-tickets](./to-tickets/SKILL.md)** — Break a plan, spec or conversation into tracer-bullet GitHub issues, each declaring its blocking edges.
- **[triage](./triage/SKILL.md)** — Move GitHub issues through the triage state machine and write agent briefs.
- **[implement](./implement/SKILL.md)** — Work a spec or GitHub issue end-to-end: pick → explore → plan → `/tdd` at pre-agreed seams → `/code-review` → commit and close.

## Model-invoked

Reusable discipline — you can invoke them, and the agent reaches for them when the task fits.

- **[grilling](./grilling/SKILL.md)** — The relentless one-question-at-a-time interview loop behind the grill skills.
- **[domain-modeling](./domain-modeling/SKILL.md)** — Build and sharpen the domain model: challenge terms, update `CONTEXT.md` inline, offer ADRs sparingly.
- **[codebase-design](./codebase-design/SKILL.md)** — Shared deep-module vocabulary (module, interface, seam, depth, leverage, locality) and design principles.
- **[prototype](./prototype/SKILL.md)** — Throwaway code that answers a design question: card variants on a preview page, or a terminal app for the geometry.
- **[tdd](./tdd/SKILL.md)** — Red → green loop at pre-agreed seams; refactoring is delegated to `code-review`.
- **[code-review](./code-review/SKILL.md)** — Three-axis review of a diff since a fixed point: a tool-run Style gate that fixes, plus Standards and Spec as parallel sub-agents that offer.
- **[diagnosing-bugs](./diagnosing-bugs/SKILL.md)** — Feedback-loop-first diagnosis: loop → reproduce and minimise → hypothesise → instrument → fix → post-mortem, including the loop for bugs that only show inside Home Assistant.
