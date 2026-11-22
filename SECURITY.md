# Security

## Reporting a problem

Please report security problems privately through
[GitHub's security advisories](https://github.com/dwaardenburg/comfortmeter-card/security/advisories/new),
not as a public issue. This is a spare-time project, so expect a reply within a couple of
weeks rather than days.

## What the card can reach

The card runs in the browser, inside Home Assistant's frontend, with the logged-in user's
access. It only reads the entities named in its configuration and sends nothing anywhere.

## Dependencies

The released `comfortmeter-card.js` bundles Lit and nothing else at runtime; everything
else in `package.json` is a build or test tool. The **Dependency security** workflow runs
`pnpm audit` over the whole lock file on every push, every pull request and weekly.
Dependabot proposes grouped npm and GitHub Actions updates weekly; they are reviewed and
merged by hand, never automatically. A clean audit means no published advisory matched
the resolved versions at that moment, not that the code is free of problems.
