# Working agreements

How Daan wants an agent to work in this repo. Most came over from his `home-assistant`
repo on 2026-11-22, where they were agreed one at a time; new ones are added here with the
date and the reason, not in one machine's agent memory.

## Git

**Work on `main`.** Commit straight to `main`; outside contributors use pull requests. No
feature branches or worktrees for Daan's own work while the card is pre-1.0. Revisit once
a stable version runs on Daan's own Home Assistant and others start contributing.
(2026-11-22)

**Commit at sync points, not per iteration.** Keep changes in the working tree while Daan
iterates, and commit when a step works or right before a release. Split by unrelated topic
when it helps, never by iteration. (from `home-assistant`, 2026-10-12)

## Issues and session cards

**A session card needs an issue first.** Before proposing work as a separate session,
open a GitHub issue for it (see [issue-tracker.md](issue-tracker.md)) and put its number in
the card's title or brief. A card expires and lives in one session; an issue survives and
can be picked up from any machine. When the card works an issue end to end, start its
brief with `/implement #<number>`. (from `home-assistant`, 2026-10-20)

## Design taste

**Guard only real failures.** Build guards and tests for what has actually gone wrong, not
for what reviewers can imagine. Name speculative scenarios once without acting on them.
(from `home-assistant`, 2026-11-05)

**Search online early for quirks.** For odd behaviour in Home Assistant's frontend, HACS
or a browser, check their GitHub issues and community.home-assistant.io before settling on
a theory. Cite the sources, and treat anecdotes as leads to verify. (from `home-assistant`,
2026-10-20)

## Writing

**No counts or numbers in lists and headings** of skills, docs and comments: no "Two
things that...", no numbered bold lead-ins. Use unnumbered bold lead-ins, so adding an
item touches nothing else. (from `home-assistant`, 2026-09-02)

## Testing

**Combine independent edge cases.** On the preview page, one card carries several
variations that don't affect each other, such as an unavailable sensor, a long name and a
narrow width, rather than a card each. Split a case out only when a card looks off and
the cause needs isolating. (2026-11-22)

## Browsers

**Ask before looking outside the conversation.** Ask Daan before opening a browser on
anything the session didn't start itself, such as a Home Assistant dashboard after a
deploy, also when the other browser is unavailable: Daan may prefer to look in person.
Pages the session launched itself, such as the preview page or a prototype on
localhost, need no asking. (2026-11-23)
