---
name: code-review
description: Review the changes since a fixed point (commit, branch, tag, or merge-base) along three axes — Style (tool-enforced conventions), Standards (does the code follow this repo's documented coding standards?), and Spec (does the code match what the originating issue/spec asked for?). Fixes style violations directly, runs the two judgement axes in parallel sub-agents, and offers the structural findings. Use when the user wants to review a branch, a PR, work-in-progress changes, or asks to "review since X".
---

Three-axis review of the diff between the working tree and a fixed point:

- **Style** — the tool-enforced conventions: ESLint, Prettier, the TypeScript type check and the Lit template check. Deterministic, so this axis **fixes** rather than reports.
- **Standards** — does the code conform to this repo's documented coding standards and stay free of structural smells?
- **Spec** — does the code faithfully implement the originating issue or spec?

Style runs first and inline. Standards and Spec run as **parallel sub-agents** so they don't pollute each other's context, then this skill aggregates their findings.

This repo's issue tracker is GitHub Issues — how to fetch an issue is documented in `documents/agents/issue-tracker.md`.

## Fix policy

The axes differ in what they are allowed to do to the code, because they differ in how certain they are:

| Axis      | Certainty       | Action                                           |
| --------- | --------------- | ------------------------------------------------ |
| Style     | A tool decided  | **Fix directly.** No need to ask.                |
| Standards | Judgement       | **Offer.** Report, then ask before changing code. |
| Spec      | Judgement       | **Offer.** Report, then ask before changing code. |

Never apply a Standards or Spec finding unasked — those are design opinions, and a wrong one costs more than it saves.

## Process

### 1. Pin the fixed point

Default to `main`, the single long-lived branch; for an outside pull request, its merge-base with `main`. Use whatever the user names instead if they name one (a commit SHA, tag, `HEAD~5`, another branch).

Capture the diff commands once:

```bash
git diff <fixed-point>                              # review content
git log <fixed-point>..HEAD --oneline               # commits, if any

# Touched files — tracked changes plus new files not yet added
{ git diff --name-only <fixed-point>; git ls-files --others --exclude-standard; } | sort -u
```

Both of these cause a silent empty review if you get them wrong:

- **Two-dot, not three.** Review usually runs before the work is committed — under `/implement` the commit is the step after this one — so the diff must include the working tree. A three-dot `...HEAD` diff would miss uncommitted work entirely.
- **`git diff --name-only` omits untracked files.** A file you created is untracked until it is added, so a plain `git diff` file list skips brand-new files — exactly the ones most likely to carry violations. Always union it with `git ls-files --others --exclude-standard`.

Confirm the fixed point resolves (`git rev-parse <fixed-point>`) and the diff is non-empty before going further. A bad ref or an empty diff should fail here, not inside two parallel sub-agents.

If the diff is empty because everything is already committed and pushed, say so and ask what to review.

### 2. Style gate — run the tools, fix what they find

```bash
pnpm run format     # ESLint --fix and Prettier --write
pnpm run lint       # ESLint, Prettier check, tsc, lit-analyzer; non-zero on any finding
```

**Fix every violation.** The Boy Scout Rule applies here: *leave the code better than you found it*. The gate covers each touched file whole, not only the lines in your hunks. Re-run until clean.

Never silence a rule with an `eslint-disable` comment or a `@ts-expect-error` to get through the gate. If a rule is wrong for this repo, that is a change to `eslint.config.mjs` with a comment saying why, and it is the user's call.

**Never rename a card option to satisfy a tool.** Option names such as `temperature_entity` live in users' dashboards; renaming one breaks every card that uses it. If a rule flags one, configure the rule.

This gate runs **before** the sub-agents so they read code that is already clean — which is also why they are told below not to re-report what the tools own.

### 3. Identify the spec source

Look for the originating spec, in this order:

1. Issue references (`#12`) in the commit messages or the pull request — fetch with `gh issue view <number> --comments`.
2. A path the user passed as an argument.
3. A spec under `documents/`.
4. If nothing is found, ask the user where the spec is. If they say there isn't one, the **Spec** sub-agent will skip and report "no spec available".

### 4. Identify the standards sources

Anything in the repo that documents how code should be written — here that's `AGENTS.md` (Conventions, "Copy the design language, not the components", Quality gates), `CONTEXT.md` for the vocabulary, and `documents/design/` for anything touching how the card looks.

On top of whatever the repo documents, the Standards axis always carries the **smell baseline** below — a fixed set of Fowler code smells (_Refactoring_, ch.3) that applies even when a repo documents nothing. These rules bind it:

- **The repo overrides.** A documented repo standard always wins; where it endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each smell is a labelled heuristic ("possible Feature Envy"), never a hard violation.
- **Skip what tooling owns.** Anything the step 2 tools enforce is already handled — see the division of labour below.

Each smell reads *what it is* → *how to fix*; match it against the diff:

- **Mysterious Name** — a function, variable, or type whose name doesn't reveal what it does or holds. → rename it; if no honest name comes, the design's murky.
- **Duplicated Code** — the same logic shape appears in more than one hunk or file in the change. → extract the shared shape, call it from both.
- **Feature Envy** — a method that reaches into another object's data more than its own. → move the method onto the data it envies.
- **Data Clumps** — the same few fields or params keep travelling together (a type wanting to be born). → bundle them into one type, pass that.
- **Primitive Obsession** — a primitive or string standing in for a domain concept that deserves its own type. → give the concept its own small type.
- **Repeated Switches** — the same `switch`/`if`-cascade on the same type recurs across the change. → replace with polymorphism, or one map both sites share.
- **Shotgun Surgery** — one logical change forces scattered edits across many files in the diff. → gather what changes together into one module.
- **Divergent Change** — one file or module is edited for several unrelated reasons. → split so each module changes for one reason.
- **Speculative Generality** — abstraction, parameters, or hooks added for needs the spec doesn't have. → delete it; inline back until a real need shows.
- **Message Chains** — long `a.b().c().d()` navigation the caller shouldn't depend on. → hide the walk behind one method on the first object.
- **Middle Man** — a class or function that mostly just delegates onward. → cut it, call the real target direct.
- **Refused Bequest** — a subclass or implementer that ignores or overrides most of what it inherits. → drop the inheritance, use composition.

#### Division of labour with the Style gate

The line is **who can decide it**:

| Concern                                                        | Owner      | Why                          |
| -------------------------------------------------------------- | ---------- | ---------------------------- |
| Formatting                                                     | Style gate | Prettier decides it          |
| Unused imports and variables, `console`, equality, Lit rules   | Style gate | ESLint decides it            |
| Types                                                          | Style gate | `tsc` decides it             |
| Template bindings, unknown elements and properties             | Style gate | lit-analyzer decides it      |
| Geometry and config behaviour                                  | Tests      | Vitest decides it            |
| Whether a name is *honest*                                     | Standards  | Only a reader can decide it  |
| Whether a comment describes what the code does                 | Standards  | Only a reader can decide it  |
| Structural smells, the design-language rule, the vocabulary    | Standards  | Only a reader can decide it  |

### 5. Spawn both sub-agents in parallel

Send a single message with two `Agent` tool calls. Use the `general-purpose` subagent for both.

**Standards sub-agent prompt** — include:

- The full diff command and commit list.
- The list of standards-source files you found in step 4, **plus the smell baseline from step 4** pasted in full — the sub-agent has no other access to it.
- The brief: "Report — per file/hunk where relevant — (a) every place the diff violates a documented standard: cite the standard (file + the rule); and (b) any baseline smell you spot: name it and quote the hunk. Distinguish hard violations from judgement calls — documented-standard breaches can be hard, but baseline smells are always judgement calls, and a documented repo standard overrides the baseline. **Formatting, lint rules, types and Lit template checks are tool-enforced and were fixed before you ran. Do not report them; assume them clean.** Flag a name that misdescribes what the code does as Mysterious Name, and a comment that is present but inaccurate. Under 400 words."

**Spec sub-agent prompt** — include:

- The diff command and commit list.
- The path or fetched contents of the spec.
- The brief: "Report: (a) requirements the spec asked for that are missing or partial; (b) behaviour in the diff that wasn't asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong. Quote the spec line for each finding. Small tidy-ups to code the change already touches are expected under the Boy Scout Rule, so do not report those as scope creep. Under 400 words."

If the spec is missing, skip the Spec sub-agent and note this in the final report.

### 6. Aggregate

Present the results under `## Style`, `## Standards`, and `## Spec` headings. Style is a short statement of what was fixed; the two sub-agent reports go in verbatim or lightly cleaned.

Do **not** merge or rerank the Standards and Spec findings — the axes are deliberately separate (see _Why the axes stay separate_).

End with a one-line summary: style violations fixed, then total findings per judgement axis and the worst issue _within each axis_ (if any). Don't pick a single winner across axes.

### 7. Act on the findings, then re-verify

Style is already fixed. For Standards and Spec, ask the user whether to fix now or open GitHub issues for later (see `documents/agents/issue-tracker.md`). Record the ones deliberately not fixed, and why.

`/tdd` stops at red → green, so refactoring belongs to this stage rather than to the implementation.

**If any code changed in this step, close the loop:**

```bash
pnpm run format
pnpm run lint
pnpm test
pnpm run build
```

The style gate ran before these fixes existed, so it has to run again after them — otherwise the review itself becomes the thing that introduces violations.

## Why the axes stay separate

A change can pass one axis and fail another:

- Code that follows every standard but implements the wrong thing → **Standards pass, Spec fail.**
- Code that does exactly what the issue asked but breaks the project's conventions → **Spec pass, Standards fail.**
- Code that is impeccably formatted and structurally rotten → **Style pass, Standards fail.**

Reporting them separately stops one axis from masking another.
