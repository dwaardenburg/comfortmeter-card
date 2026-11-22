# Contributing

Thanks for your interest. The card is in development (0.x) and maintained in spare time,
so for anything larger than a fix, please open an
[issue](https://github.com/dwaardenburg/comfortmeter-card/issues) first so the approach
can be discussed before you spend time on it.

## Reporting a bug

Use the bug report form. The card YAML, the card and Home Assistant versions, and a
screenshot with any browser console errors are what make a bug reproducible.

## Development setup

You need Node 24 and pnpm (`npm install -g pnpm`, or Corepack).

```bash
pnpm install
pnpm run build      # dist/comfortmeter-card.js
pnpm run dev        # rebuilds on every change
pnpm test           # Vitest
pnpm run lint       # ESLint, Prettier, TypeScript and the Lit template check
pnpm run format     # fix what ESLint and Prettier can fix
```

The toolchain follows [Home Assistant's frontend](https://github.com/home-assistant/frontend):
Lit, TypeScript, rspack, Vitest, ESLint and Prettier, with pnpm.

To try a build on your own Home Assistant, copy `dist/comfortmeter-card.js` to
`/config/www/` and add `/local/comfortmeter-card.js?v=<anything new>` as a dashboard
resource; changing the query string makes the browser fetch the new file.

## Pull requests

- Branch from `main` and open the pull request against `main`.
- Keep a pull request to one change, and say what it changes for someone using the card.
- `pnpm run lint` and `pnpm test` must pass; CI runs both, plus the build.
- Add a line under **Unreleased** in [CHANGELOG.md](CHANGELOG.md) when users would notice
  the change.
- The words in [CONTEXT.md](CONTEXT.md) are the project's vocabulary; please use them in
  code and docs.

## Releasing

For the maintainer: set the version in `package.json`, rename **Unreleased** in
`CHANGELOG.md` to that version, push, then run the **Release** workflow with the same
version. It checks all three agree, builds, and publishes the GitHub Release that HACS
installs from.
