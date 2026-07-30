# AGENTS.md

Guidance for coding agents (Claude Code, Codex, and others) and contributors
working in this repository. `CLAUDE.md` is a symlink to this file. If
`.local/AGENTS.md` or `.local/CLAUDE.md` exists, read it as well; it contains
personal or machine-local overrides and is not tracked. Put local instructions
there instead of editing this shared guide for one machine.

This repository contains the Docusaurus sources for the GreptimeDB
documentation published at <https://docs.greptime.com> and
<https://docs.greptime.cn>.

## Core commands

| Task | Command |
| --- | --- |
| Install dependencies | `pnpm install` |
| Preview English docs | `pnpm start` |
| Preview Chinese docs | `pnpm start:zh` |
| Build English docs | `pnpm build` |
| Build Chinese docs | `DOC_LANG=zh pnpm build` |
| Strict English link check | `DOC_LANG=en pnpm check:links` |
| Strict Chinese link check | `DOC_LANG=zh pnpm check:links` |
| Unit tests | `pnpm test` |
| Type check | `pnpm typecheck` |
| Preview a backport | `pnpm backport:dry` |
| Backport the last commit | `pnpm backport` |

Use pnpm; do not update `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`
unless the task changes dependencies. CI uses Node.js 22 and pnpm 8.6.0.

## Repository map

- `docs/`: English Nightly documentation for unreleased GreptimeDB changes.
- `versioned_docs/version-<version>/`: English snapshots for released versions.
- `i18n/zh/docusaurus-plugin-content-docs/current/`: Chinese Nightly docs.
- `i18n/zh/docusaurus-plugin-content-docs/version-<version>/`: Chinese released
  docs.
- `sidebars.ts` and `versioned_sidebars/`: English navigation.
- `i18n/zh/docusaurus-plugin-content-docs/*.json`: Chinese navigation labels.
- `versions.json`: released documentation versions, newest first.
- `variables/`: values used by `VAR::<name>` placeholders for Nightly and each
  released version.
- `src/components/`, `src/theme/`, and `src/plugins/`: Docusaurus components,
  theme overrides, and build plugins.
- `skills/`: source files for published GreptimeDB agent skills.
- `static/`: images and other site assets. Some files here are generated.
- `blog/`: release notes.

## Read before changing docs

- [`CONTRIBUTING.md`](CONTRIBUTING.md) for document structure, links, images,
  placeholders, and contribution flow.
- [`docusaurus.config.ts`](docusaurus.config.ts) for locales, version routing,
  excluded templates, and build behavior.
- [`sidebars.ts`](sidebars.ts) when adding, moving, or deleting Nightly docs.
- [`scripts/backport-docs.js`](scripts/backport-docs.js) before using the
  backport command.

For link and anchor work, also read:

- [`src/components/AnchorAlias/index.tsx`](src/components/AnchorAlias/index.tsx)
- [`src/theme/MDXComponents.js`](src/theme/MDXComponents.js)

## Version and locale scope

Decide the intended versions and locales before editing:

- Put unreleased features in `docs/` and the Chinese `current/` tree.
- Apply fixes to every released version where the same problem exists, but do
  not backport behavior or options that the corresponding GreptimeDB release
  does not support.
- Keep English and Chinese documents aligned in meaning. Do not copy English
  prose, headings, or anchors blindly into Chinese files.
- Treat versioned docs as user-facing release documentation, not generated
  files that can be overwritten without review.
- When creating a released documentation version, keep `versions.json`,
  `versioned_docs/`, `versioned_sidebars/`, the Chinese version directory and
  sidebar JSON, and `variables/variables-<version>.ts` consistent.

`pnpm backport` applies the last commit to the latest released English and
localized docs. Run `pnpm backport:dry` first, then inspect the resulting diff;
the script cannot decide whether a change is semantically valid for that
release.

## Writing and technical accuracy

- Use plain, direct English. Avoid marketing filler and vague claims.
- Write Chinese naturally for Chinese developers; avoid literal translation
  and English sentence structure.
- Keep commands, SQL, configuration keys, API names, and code examples exact
  and copy-pasteable.
- Verify version-sensitive behavior against the applicable GreptimeDB release,
  source code, or authoritative reference. Do not infer it from a nearby page.
- New documentation pages need suitable front matter, including `keywords` and
  `description`, an H1 title, and the appropriate sidebar entry.

## Links and anchors

Always include the `.md` extension in links to documentation source files:

```markdown
[Ingest data](/user-guide/ingest-data/overview.md)
```

Root-relative documentation paths are resolved inside the reader's current
documentation version. Prefer them for links that should remain within that
version.

Before changing a link, read both the source paragraph and the destination
section. A link can intentionally land on an overview or option section that
routes the reader to a more detailed page. Do not replace a valid target only
because another page appears more direct. A passing checker proves that a
target exists; it does not prove that the target is semantically correct.

Heading slugs are public URLs. Renaming a heading or replacing an established
anchor can break external links. Preserve stable anchors when the content still
represents the same concept.

Use the global `AnchorAlias` MDX component when a renamed or translated heading
needs to retain an existing anchor:

```mdx
<AnchorAlias id="upload-a-pipeline" />

## Upload the Pipeline
```

Rules for `AnchorAlias`:

- Place it immediately before the heading for the exact section represented by
  the alias.
- Use the incoming legacy or cross-locale slug as `id`; keep IDs unique within
  the page.
- Do not import it in individual documents. It is registered globally in
  `src/theme/MDXComponents.js`.
- Use it instead of a raw `<span id="...">`; the component also registers the
  anchor with Docusaurus's broken-link collector.
- Do not add or move an alias merely to silence the checker. If the source link
  intends a different section, fix the link instead.

Strict link checks build Nightly and every released version from 1.0 onward.
Run them for both locales after changing links, headings, routes, version
configuration, or MDX anchor handling. Older 0.x docs are outside that strict
CI scope unless the task explicitly includes them.

## Generated files and placeholders

- Edit `skills/<name>/SKILL.md`, not `static/SKILL.md` or
  `static/skills/**`. `pnpm sync-skill`, `prestart`, and `prebuild` regenerate
  the static copies.
- Do not edit `build/`, `.docusaurus/`, or transpiled JavaScript generated from
  tracked TypeScript.
- Generate `docs/reference/sql/functions/df-functions.md` with
  `ruby src/misc/update_functions.rb`, then update the corresponding localized
  file as described in `CONTRIBUTING.md`.
- Define `VAR::<name>` values in the matching file under `variables/`. A
  versioned document must not silently fall back to a value for another
  release.

## Before opening or updating a PR

1. Review the complete diff for unintended versions, locales, generated files,
   and lockfile changes.
2. Run `git diff --check`.
3. Run `pnpm test` for code, plugin, or configuration changes.
4. Run the applicable locale builds.
5. Run both strict link checks for link, heading, route, version, localization,
   or MDX changes.
6. Manually inspect changed link destinations; do not rely only on build
   success.
7. Update navigation when documents are added, moved, or removed.
8. Use a Conventional Commit-style PR title and complete
   [`.github/pull_request_template.md`](.github/pull_request_template.md)
   accurately, including version and localization scope.
