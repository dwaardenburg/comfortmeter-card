# Issue tracker: GitHub Issues

Everything is tracked in this repo's
[GitHub Issues](https://github.com/dwaardenburg/comfortmeter-card/issues): Daan's own
plans and reports from people using the card. Reach it with the `gh` CLI, authenticated as
a user with write access.

## When a skill says "publish to the issue tracker"

```bash
gh issue create --title "<title>" --body-file <file> --label ready-for-agent --label "plan:<slug>"
```

Write the body to a file first; it keeps Markdown intact on Windows shells. A label must
exist before it is used: create a missing `plan:<slug>` label with
`gh label create "plan:<slug>" --color ededed`.

## When a skill says "fetch the relevant ticket"

```bash
gh issue view <number> --comments
gh issue list --label "plan:<slug>" --state open
```

## Plans and blocking

Group the issues that make up one plan with a shared `plan:<slug>` label. Each issue's body
carries a **Parent** line and its **Blocked by #n** edges as prose, so a plan's frontier
can be read from `gh issue list --label plan:<slug>`.

## Labels

The triage roles are in [triage-labels.md](triage-labels.md). `bug` and `enhancement` come
from the issue forms. `gh issue edit <n> --add-label x --remove-label y` changes labels
without touching the others.

## Closing

Close an issue only when the work is committed and verified:
`gh issue close <n> --comment "<what was done, and the commit>"`. A decided-against issue
gets the `wontfix` label and a comment saying why, then is closed with
`--reason "not planned"`.

## Outside reporters

Issues from other people are public conversations. Be courteous, ask for what the bug form
asks for when it is missing (the `needs-info` label), and never paste anything from Daan's
own Home Assistant (URLs, entity names, logs) into a reply.
