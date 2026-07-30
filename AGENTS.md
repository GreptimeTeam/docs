# AGENTS.md

Guidance for coding agents and contributors working in this repository.
`CLAUDE.md` is a symlink to this file. Also read `.local/AGENTS.md` or
`.local/CLAUDE.md` when present; those files contain untracked local overrides.

This is the short operating guide. [`CONTRIBUTING.md`](CONTRIBUTING.md) is the
source of truth for document structure, links, images, placeholders, and the
contribution flow.

## Setup and commands

Use Node.js 20 or newer and pnpm 8.6.0. CI currently runs Node.js 22.

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

`DOC_LANG` selects the locale. `prestart` and `prebuild` run
`pnpm sync-skill`; do not bypass them when checking the site. The strict link
commands build Nightly and every released version from 1.0 onward.

Use pnpm. Dependency changes should update `pnpm-lock.yaml`; docs-only changes
must not touch lockfiles.

## Repository map

- `docs/`: English Nightly docs for unreleased changes.
- `versioned_docs/version-<version>/`: English docs for released versions.
- `i18n/zh/docusaurus-plugin-content-docs/current/`: Chinese Nightly docs.
- `i18n/zh/docusaurus-plugin-content-docs/version-<version>/`: Chinese released
  docs.
- `sidebars.ts`, `versioned_sidebars/`, and the JSON files under
  `i18n/zh/docusaurus-plugin-content-docs/`: navigation.
- `versions.json`: released doc versions, newest first.
- `variables/`: values for `VAR::<name>` placeholders.
- `src/components/`, `src/theme/`, and `src/plugins/`: Docusaurus code.
- `skills/`: sources for published GreptimeDB agent skills.
- `static/`: site assets and generated skill copies.
- `blog/`: release notes.

High-signal files are `docusaurus.config.ts`, `package.json`, `sidebars.ts`,
`.github/pull_request_template.md`, and the files linked from the relevant
section of `CONTRIBUTING.md`.

## Contribution workflow

1. Read `CONTRIBUTING.md` and the existing pages around the change.
2. Decide the version and locale scope before editing.
3. Make the smallest consistent change. Add front matter, an H1, and navigation
   entries for a new page.
4. Preview or build the affected locale.
5. Run the checks required by the change.
6. Review the complete diff for unintended versions, locales, generated files,
   and lockfile changes.
7. Open a PR with a Conventional Commit-style title and complete
   `.github/pull_request_template.md` accurately.

Use `docs/` and the Chinese `current/` tree for unreleased features. Apply a fix
to released versions only where the same problem exists and the documented
behavior is valid for that GreptimeDB release. Keep English and Chinese aligned
in meaning, but do not copy English headings or prose blindly into Chinese.

Versioned docs are user-facing sources, not disposable generated files. When
creating a version, keep `versions.json`, `versioned_docs/`,
`versioned_sidebars/`, the matching Chinese directory and sidebar JSON, and
`variables/variables-<version>.ts` consistent.

`pnpm backport` applies the last commit to the latest released English and
Chinese docs. Run `pnpm backport:dry` first and review the result. The script
cannot determine whether a change is valid for that release.

## Writing and accuracy

- Use plain, direct English. Avoid marketing filler and vague claims.
- Write Chinese naturally for Chinese developers; avoid literal translation.
- Keep commands, SQL, configuration keys, API names, and examples exact and
  copy-pasteable.
- Verify version-sensitive behavior against the applicable GreptimeDB release,
  source code, or an authoritative reference.
- Do not infer behavior from a nearby page or a newer documentation version.

## Links and anchors

Include the `.md` extension in links to documentation source files:

```markdown
[Ingest data](/user-guide/ingest-data/overview.md)
```

Root-relative paths keep readers in their current documentation version.

Read the source paragraph and the destination section before changing a link.
A target can intentionally be an overview or option section that sends readers
to a detailed page. A green link checker proves that the target exists, not
that it is the right target.

Heading slugs are public URLs. Preserve established anchors when a heading is
renamed or translated and the section still represents the same concept.

Use the global `AnchorAlias` component for a legacy or cross-locale slug:

```mdx
<AnchorAlias id="upload-a-pipeline" />

## Upload the Pipeline
```

`AnchorAlias` is registered in `src/theme/MDXComponents.js`, so individual
documents do not import it. It also registers the ID with Docusaurus's
broken-link collector; a raw `<span id="...">` does not.

Place an alias immediately before the exact heading it represents. Keep IDs
unique within the page. Never add or move an alias only to silence the checker;
fix the source link when it intends a different section.

Run both strict link commands after changing links, headings, routes, version
configuration, localization, or MDX anchor handling. The strict CI scope
excludes 0.x docs unless the task includes them.

## Generated files

- Edit `skills/<name>/SKILL.md`, not `static/SKILL.md` or `static/skills/**`.
  `pnpm sync-skill` regenerates the static copies.
- Do not edit `build/`, `.docusaurus/`, or JavaScript transpiled from tracked
  TypeScript.
- Generate `docs/reference/sql/functions/df-functions.md` with
  `ruby src/misc/update_functions.rb`, then update the matching localized file.
- Define placeholders in the matching `variables/variables-<version>.ts`.
  Never let a versioned page silently use another release's value.

## Checks before a PR

Always run `git diff --check` and inspect the diff manually.

| Change | Required checks |
| --- | --- |
| Documentation text only | Build the affected locale |
| Links, headings, routes, versions, or localization | Both strict link commands |
| Components, plugins, theme, or configuration | `pnpm test`, `pnpm typecheck`, and affected builds |
| Navigation | Build each affected locale and inspect the sidebar |

CI also checks Markdown and spelling. Build success does not replace manual
review of technical claims and link destinations.
