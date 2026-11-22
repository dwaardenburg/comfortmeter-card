---
name: domain-modeling
description: Build and sharpen a project's domain model. Use when the user wants to pin down domain terminology or a ubiquitous language, record an architectural decision, or when another skill needs to maintain the domain model.
---

# Domain Modeling

Actively build and sharpen the project's domain model as you design. This is the *active* discipline — challenging terms, inventing edge-case scenarios, and writing the glossary and decisions down the moment they crystallise. (Merely *reading* `CONTEXT.md` for vocabulary is not this skill — that's a one-line habit any skill can do. This skill is for when you're changing the model, not just consuming it.)

## File structure

This repo is **single-context** — the layout is documented in `documents/agents/domain.md`:

```
/
├── CONTEXT.md                 ← the domain glossary
├── documents/
│   ├── design/                ← how the card looks and why, with Home Assistant's numbers
│   ├── research/              ← dated findings with their sources
│   └── architecture/          ← ADRs: 0001-slug.md, 0002-slug.md, ... (does not exist yet)
├── src/                       ← the card
└── test/
```

Create files lazily — only when you have something to write. `documents/architecture/` is still absent; create it when the first ADR earns it. Daan wants no ADRs while the design is still settling, so hold the bar below high.

The notes in `documents/design/` are **not** ADRs and should not be retrofitted into them. They describe the look and the numbers behind it; a decision that meets the ADR bar gets its own ADR that links to the note.

## During the session

### Challenge against the glossary

When the user uses a term that conflicts with the existing language in `CONTEXT.md`, call it out immediately. "Your glossary defines the comfort zone as where the needles cross when the air is comfortable, but you seem to mean the whole hatched area including the tolerable band — which is it?"

### Sharpen fuzzy language

When the user uses vague or overloaded terms, propose a precise canonical term. "You're saying 'the scale' — do you mean the humidity scale, the temperature scale, or the arc both sit on? Those move independently."

### Discuss concrete scenarios

When domain relationships are being discussed, stress-test them with specific scenarios. Invent scenarios that probe edge cases and force the user to be precise about the boundaries between concepts.

### Cross-reference with code

When the user states how something works, check whether the code agrees. If you find a contradiction, surface it: "`parseConfig` rejects a missing `humidity_entity`, but you just described the card falling back to temperature only — which is right?"

### Update CONTEXT.md inline

When a term is resolved, update `CONTEXT.md` right there. Don't batch these up — capture them as they happen. Use the format in [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md).

`CONTEXT.md` should be totally devoid of implementation details. Do not treat `CONTEXT.md` as a spec, a scratch pad, or a repository for implementation decisions. It is a glossary and nothing else.

### Offer ADRs sparingly

Only offer to create an ADR when all three are true:

1. **Hard to reverse** — the cost of changing your mind later is meaningful
2. **Surprising without context** — a future reader will wonder "why did they do it this way?"
3. **The result of a real trade-off** — there were genuine alternatives and you picked one for specific reasons

If any of the three is missing, skip the ADR. Use the format in [ADR-FORMAT.md](./ADR-FORMAT.md).
