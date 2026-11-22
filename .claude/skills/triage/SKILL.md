---
name: triage
description: Move GitHub issues through a state machine of triage roles — categorise, verify, grill if needed, and write agent-ready briefs.
disable-model-invocation: true
---

# Triage

Move this repo's GitHub issues through a small state machine of triage roles.

How to read, edit and label issues is documented in `documents/agents/issue-tracker.md`; the mapping from role names to labels is in `documents/agents/triage-labels.md`. Read both before acting.

Issues come from two kinds of reporter: Daan, the maintainer, and people using the card. `needs-info` means "waiting on whoever reported it", and an outside reporter is a stranger in a public conversation — see "Outside reporters" in the issue tracker doc.

## Reference docs

- [AGENT-BRIEF.md](AGENT-BRIEF.md) — how to write durable agent briefs

## Roles

**Category** roles:

- `bug` — something is broken
- `enhancement` — new feature or improvement

**State** roles:

- `needs-triage` — the maintainer needs to evaluate
- `needs-info` — open questions for the reporter are on the issue
- `ready-for-agent` — fully specified, ready for an AFK agent
- `ready-for-human` — needs human implementation
- `wontfix` — will not be actioned

Every triaged issue should carry exactly one category role and one state role, as labels (`gh issue edit <n> --add-label x --remove-label y`). If state roles conflict, flag it and ask the maintainer before doing anything else.

State transitions: an unlabelled issue normally goes to `needs-triage` first; from there it moves to `needs-info`, `ready-for-agent`, `ready-for-human`, or `wontfix`. `needs-info` returns to `needs-triage` once the reporter answers. The maintainer can override at any time — flag transitions that look unusual and ask before proceeding.

## Invocation

The maintainer invokes `/triage` and describes what they want in natural language. Interpret the request and act. Examples:

- "Show me anything that needs my attention"
- "Let's look at #42"
- "Move #42 to ready-for-agent"
- "What's ready for agents to pick up?"

## Show what needs attention

List the open issues (`gh issue list --state open --json number,title,labels,updatedAt,author`) and present these buckets, oldest first:

- **Unlabelled, or only a category** — never triaged.
- **`needs-triage`** — evaluation in progress.
- **`needs-info` with a reply since the triage notes** — the reporter may have answered; needs re-evaluation.

Show counts and a one-line summary per item. Let the maintainer pick.

## Triage a specific issue

1. **Gather context.** Read the full issue with its comments (`gh issue view <n> --comments`). Parse any prior triage notes so you don't re-ask resolved questions. Explore the codebase using `AGENTS.md`, `CONTEXT.md` and `documents/design/`. Run a **redundancy check**: search for an existing implementation of the requested behaviour by domain concept (not just the request's wording), and for a duplicate issue, and report where you looked. If found, it's a `wontfix` (step 5).

2. **Recommend.** Tell the maintainer your category and state recommendation with reasoning, plus a brief codebase summary relevant to the request — including whether it's already implemented. Wait for direction.

3. **Verify the claim.** Before any grilling, check that the claim holds up. For a bug, reproduce it from the steps and card YAML in the issue (the `/diagnosing-bugs` loops apply). Report what happened: confirmed (with code path), failed, or insufficient detail (a strong `needs-info` signal). A confirmed verification makes a much stronger agent brief.

4. **Grill (if needed).** If the request needs fleshing out, run the `/grilling` and `/domain-modeling` skills together with the maintainer — one question at a time, sharpening terms and updating `CONTEXT.md` inline as decisions land.

5. **Apply the outcome.** Post comments with `gh issue comment <n> --body-file <file>`; nothing here edits the reporter's own text.
   - `ready-for-agent` — post an agent brief as a comment ([AGENT-BRIEF.md](AGENT-BRIEF.md)).
   - `ready-for-human` — same structure as an agent brief, but note why it can't be delegated (judgement calls, design decisions, testing on a real dashboard).
   - `needs-info` — post triage notes (template below). For an outside reporter, ask plainly and thank them.
   - `wontfix` — the closing comment depends on *why*:
     - **Already implemented or a duplicate** — point to where it lives, or the other issue, and close.
     - **Rejected** — say why before closing as not planned. If the reason is load-bearing (a future session would re-suggest the same thing), offer an ADR per the `/domain-modeling` skill first.
   - `needs-triage` — apply the label. Optional comment if there's partial progress.

## Quick state override

If the maintainer says "move #42 to ready-for-agent", trust them and apply the role directly. Confirm what you're about to do (label changes, comments, closing), then act. Skip grilling. If moving to `ready-for-agent` without a grilling session, ask whether they want an agent brief written.

## Needs-info template

```markdown
## Triage notes

**What we've established so far:**

- point
- point

**Open questions:**

- question
- question
```

Capture everything resolved during grilling under "established so far" so the work isn't lost. Questions must be specific and actionable, not "please provide more info".

## Resuming a previous session

If prior triage notes exist on the issue, read them, check whether the reporter has answered any outstanding questions, and present an updated picture before continuing. Don't re-ask resolved questions.
