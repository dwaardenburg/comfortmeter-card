# CLAUDE.md

This file is the entrypoint for Claude Code. Repo rules, conventions and workflow live in
[AGENTS.md](AGENTS.md); read it before making changes. How Daan wants an agent to work
here is in [documents/agents/working-agreements.md](documents/agents/working-agreements.md);
record new agreements there rather than in one machine's memory.

The vocabulary is in [CONTEXT.md](CONTEXT.md). How the card copies Home Assistant's
design language is in [documents/design/](documents/design/).

## Skills

The skills in `.claude/skills/` came over from Daan's `home-assistant` repo, adapted to
this toolchain and to GitHub Issues. [.claude/skills/README.md](.claude/skills/README.md)
is the index.

## Quick reference

- Install: `pnpm install`
- Build: `pnpm run build` (writes `dist/comfortmeter-card.js`), `pnpm run dev` to watch
- Test: `pnpm test`
- Quality gates: `pnpm run lint` (ESLint, Prettier, TypeScript, Lit template check);
  `pnpm run format` fixes what it can
- Issues: GitHub Issues through `gh`, see
  [documents/agents/issue-tracker.md](documents/agents/issue-tracker.md)
- **Committing is not releasing.** Nothing reaches HACS users until the hand-started
  **Release** workflow runs; see [CONTRIBUTING.md](CONTRIBUTING.md).
