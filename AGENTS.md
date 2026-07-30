# AGENTS.md

Guidance for coding agents working in this repository. `CLAUDE.md` imports this
file. Also read `.local/AGENTS.md` or `.local/CLAUDE.md` when present; those
files contain untracked, machine-local instructions.

[`CONTRIBUTING.md`](CONTRIBUTING.md) is the source of truth for contribution
workflow, document structure, links, images, placeholders, and reference
snippets. Read it before editing.

## Setup and commands

Use Node.js 22 and pnpm 8.6.0 to match the main build CI. `package.json`
currently allows Node.js 18 or newer.

| Task | Command |
| --- | --- |
| Install dependencies | `pnpm install` |
| Preview English | `pnpm start` |
| Preview Chinese | `pnpm start:zh` |
| Build English | `pnpm build` |
| Build Chinese | `DOC_LANG=zh pnpm build` |
| Check English links and anchors | `DOC_LANG=en pnpm check:links` |
| Check Chinese links and anchors | `DOC_LANG=zh pnpm check:links` |
| Run unit tests | `pnpm test` |
| Run TypeScript checks | `pnpm typecheck` |
| Preview the latest-version backport | `pnpm backport:dry` |
| Apply the latest-version backport | `pnpm backport` |

`DOC_LANG` selects the locale. The repository enables pnpm pre/post scripts;
`prestart` and `prebuild` run `pnpm sync-skill`. Use the package scripts so
local and CI builds include the same generated skill content.

Use pnpm. Dependency changes should update `pnpm-lock.yaml`; docs-only changes
must not touch lockfiles.

## Repository map

- `docs/`: English Nightly docs for unreleased changes.
- `versioned_docs/version-<version>/`: English released docs.
- `i18n/zh/docusaurus-plugin-content-docs/current/`: Chinese Nightly docs.
- `i18n/zh/docusaurus-plugin-content-docs/version-<version>/`: Chinese released
  docs.
- `sidebars.ts`, `versioned_sidebars/`, and the JSON files under
  `i18n/zh/docusaurus-plugin-content-docs/`: navigation.
- `variables/`: version-specific `VAR::<name>` values.
- `src/`: Docusaurus components, theme overrides, plugins, and scripts.
- `skills/`: source files for published agent skills.
- `static/`: site assets and generated skill copies.
- `blog/`: release notes.

## Rules agents must follow

- Decide the version and language scope before editing. Use `docs/` and the
  Chinese `current/` tree for unreleased features. Change a released version
  only when the content is valid for that GreptimeDB release.
- Treat versioned docs as user-facing source files, not disposable generated
  output. When adding or expanding user-facing documentation, update the
  corresponding Chinese page in the same PR. Keep English and Chinese aligned
  in meaning, but write each language naturally.
- Verify version-sensitive claims against the applicable release, source code,
  or an authoritative reference. Do not infer behavior from a nearby page or a
  newer documentation version.
- Read the source paragraph and destination section before changing a link. A
  green link checker proves that the target exists, not that it is the intended
  target.
- Preserve established heading URLs when the section still represents the
  same concept. Use the global `AnchorAlias` component for a legacy or
  cross-locale slug; a raw `<span id="...">` is not registered with
  Docusaurus's broken-link collector. Place the alias immediately before the
  exact heading it represents, and never move one merely to silence the
  checker.
- Edit `skills/<name>/SKILL.md`, not generated files under `static/skills/` or
  `static/SKILL.md`. Do not edit `build/`, `.docusaurus/`, or JavaScript
  transpiled from tracked TypeScript.
- Run `pnpm backport:dry` before `pnpm backport` and inspect the result. The
  script cannot decide whether a change is valid for a released version.

See the detailed guidance in
[`CONTRIBUTING.md`](CONTRIBUTING.md#add-or-update-documentation),
[`Links and anchors`](CONTRIBUTING.md#links-and-anchors), and
[`Variables and generated files`](CONTRIBUTING.md#variables-and-generated-files).

## Checks before a PR

Always run `git diff --check` and review the complete diff for unintended
versions, languages, generated files, and lockfile changes.

| Change | Required checks |
| --- | --- |
| Documentation text only | Build the affected locale |
| Links, headings, routes, versions, or localization | Both strict link commands |
| Components, plugins, theme, or configuration | `pnpm test`, `pnpm typecheck`, and affected builds |
| Navigation | Build each affected locale and inspect the sidebar |

CI also checks Markdown, spelling, front matter, and the PR title. Build success
does not replace manual review of technical claims and link destinations.
