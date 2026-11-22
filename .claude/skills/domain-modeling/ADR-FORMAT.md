# ADR Format

An **ADR (Architecture Decision Record)** is a short document — often just a paragraph — that records what was decided and why, so future readers don't undo deliberate choices by accident. The value is not in the format but in capturing the reasoning before it's forgotten.

In this repo ADRs live in `documents/architecture/` and use sequential numbering: `0001-slug.md`, `0002-slug.md`, etc.

Create the `documents/architecture/` directory lazily — only when the first ADR is needed.

## Template

```md
# {Short title of the decision}

{1-3 sentences: what's the context, what did we decide, and why.}
```

That's it. An ADR can be a single paragraph. The value is in recording *that* a decision was made and *why* — not in filling out sections.

## Optional sections

Only include these when they add genuine value. Most ADRs won't need them.

- **Status** frontmatter (`proposed | accepted | deprecated | superseded by ADR-NNNN`) — useful when decisions are revisited
- **Considered Options** — only when the rejected alternatives are worth remembering
- **Consequences** — only when non-obvious downstream effects need to be called out

## Numbering

Scan `documents/architecture/` for the highest existing number and increment by one. The directory does not exist yet — the first ADR is `0001-slug.md`.

## When to offer an ADR

All three of these must be true:

1. **Hard to reverse** — the cost of changing your mind later is meaningful
2. **Surprising without context** — a future reader will look at the code and wonder "why on earth did they do it this way?"
3. **The result of a real trade-off** — there were genuine alternatives and you picked one for specific reasons

If a decision is easy to reverse, skip it — you'll just reverse it. If it's not surprising, nobody will wonder why. If there was no real alternative, there's nothing to record beyond "we did the obvious thing."

### What qualifies

- **Architectural shape.** "The geometry is plain functions; the element only renders what they return."
- **Technology choices that carry lock-in.** The rendering approach (SVG or canvas), the card's YAML option names. Not every dependency — just the ones a change would ripple through.
- **Boundary and scope decisions.** "The card shows; it never sets the thermostat." The explicit no-s are as valuable as the yes-s.
- **Deliberate deviations from the obvious path.** "Re-draw the thermostat's arc rather than reuse `ha-control-circular-slider`" reads backwards until you know Home Assistant's elements are not a public API. Anything where a reasonable reader would assume the opposite belongs here — it stops the next engineer from "fixing" something deliberate.
- **Constraints not visible in the code.** "Card option names are in users' dashboards, so renaming one breaks them."
- **Rejected alternatives when the rejection is non-obvious.**
