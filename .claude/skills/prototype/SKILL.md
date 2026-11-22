---
name: prototype
description: Build a throwaway prototype to answer a design question. Use when the user wants to sanity-check whether a state model or logic feels right, or explore what the card should look like.
---

# Prototype

A prototype is **throwaway code that answers a question**. The question decides the shape.

## Pick a branch

Identify which question is being answered — from the user's prompt, the surrounding code, or by asking if the user is around:

- **"Does this logic / state model feel right?"** → [LOGIC.md](LOGIC.md). Build a tiny interactive terminal app that pushes the logic through cases that are hard to reason about on paper: needle angles at the ends of a scale, readings outside the scale, units.
- **"What should this look like?"** → [UI.md](UI.md). Several radically different versions of the card on one preview page, switchable with `?variant=`.

The two branches produce very different artifacts — getting this wrong wastes the whole prototype. This repo is a visual card, so **UI is the usual branch**; reach for logic when the question is about the geometry or the maths rather than the look.

## Rules that apply to both

- **Throwaway from day one, and clearly marked as such.** Prototypes live under `prototype/<question>/`, outside `src/`, so neither the build nor the release can pick one up. The folder name is the marker.
- **One command to run.** Put it at the top of the prototype's `NOTES.md`. The user must be able to start it without thinking.
- **No persistence and no Home Assistant.** Use a fake `hass` object with hand-picked states. A prototype never talks to a real Home Assistant.
- **Skip the polish.** No tests, no error handling beyond what makes the prototype _runnable_, no abstractions. The point is to learn something fast and then delete it.
- **Surface the state.** After every action (logic) or on every variant switch (UI), show the full relevant state so the user can see what changed.
- **Delete or absorb when done.** When the prototype has answered its question, either delete it or fold the validated decision into the real code — don't leave it rotting in the repo.

## When done

The _answer_ is the only thing worth keeping from a prototype. Capture it somewhere durable (`documents/design/`, an issue, or a commit message) along with the question it was answering. If the user is around, that capture is a quick conversation; if not, leave the question and the variants in `NOTES.md` so they (or you, on the next pass) can fill in the verdict before deleting the prototype.
