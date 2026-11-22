---
name: implement
description: "Implement a piece of work based on a spec or set of tickets. Use when the user wants to work a GitHub issue end-to-end."
disable-model-invocation: true
---

# Implement

Implement the work described by the user in the spec or issues. When the work lives in a GitHub issue, carry it end-to-end: pick → explore → plan → implement → review → close.

The issue tracker commands used below are documented in `documents/agents/issue-tracker.md`.

## 1. Pick the work

If the user pointed at a spec or issue, work from that (`gh issue view <number> --comments`). Otherwise list the open issues (`gh issue list --label ready-for-agent`) and ask which to work on. Note the issue number for step 6.

## 2. Explore

Use the Agent tool with `subagent_type=Explore` to understand the code relevant to the work. Read `AGENTS.md` and `CONTEXT.md` before anything else, and `documents/design/` if the work changes how the card looks.

## 3. Plan

Use the `EnterPlanMode` tool to enter plan mode. For work that changes interfaces, run the `/grilling` skill before writing them — walk constraints, dependencies, and what tests survive, using the `/codebase-design` vocabulary. For other work, plan normally.

Steps 1-2 (pick, explore) run outside plan mode. Plan mode covers this step only — write the plan, get approval, then exit and implement.

## 4. Implement

Use /tdd where possible, at pre-agreed seams. The geometry and config logic are plain functions, which is where most seams are.

Mind the rules in `AGENTS.md` while you work: copy Home Assistant's design language, never import its internal elements, and never rename a card option users already have in their dashboards without listing it under **Breaking changes**.

Run the checks regularly as you go, and all of them once at the end — the canonical gates live in `AGENTS.md` (Quality gates):

```bash
pnpm run lint
pnpm test
pnpm run build
```

A change to how the card looks is not done until it has been seen: build it and look at it in a preview page or on a real dashboard, in a light and a dark theme.

## 5. Review

After tests are green, run `/code-review` against `main`. It owns the whole review pass — style, standards, spec — and it re-verifies itself after any fixes it makes.

What it will do, since the work is still uncommitted at this point:

- **Style violations it fixes directly.** They are tool-decided, so there is nothing to deliberate. Every file you touched gets left clean, not just the lines you changed.
- **Standards and spec findings it offers.** Those are judgement calls — decide each one, and record why for any you skip.

## 6. Commit and close

Add a line under **Unreleased** in `CHANGELOG.md` if someone using the card would notice the change. Commit to `main` with `#<number>` in the message, push, then close the issue with `gh issue close <number> --comment "<what was done>"`.

**Committing is not releasing.** Nothing reaches HACS users until the Release workflow runs, and that is Daan's call. Do not release as part of closing an issue.

## Vocabulary

Use the shared design vocabulary from the `/codebase-design` skill when discussing the work — key terms: **module**, **interface**, **seam**, **depth**, **leverage**, **locality**.
