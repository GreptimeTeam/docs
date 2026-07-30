# Contributing to GreptimeDB Docs

Contributions to the GreptimeDB documentation are welcome. Use an issue to
report incorrect, missing, or outdated documentation. Use a pull request for a
concrete fix or new document.

For GreptimeDB product bugs and feature requests, use the
[GreptimeDB repository](https://github.com/GreptimeTeam/greptimedb/issues).

## Before you start

- Find the documentation version and language affected by the change.
- Read the existing page and nearby pages before changing structure or links.
- Verify technical claims against the applicable GreptimeDB release.
- Keep a pull request focused on one logical change.

## Set up the project

Use Node.js 22 and pnpm 8.6.0 to match the main build CI. `package.json`
currently allows Node.js 18 or newer.

```shell
pnpm install
```

Common commands:

| Task | Command |
| --- | --- |
| Preview English | `pnpm start` |
| Preview Chinese | `pnpm start:zh` |
| Build English | `pnpm build` |
| Build Chinese | `DOC_LANG=zh pnpm build` |
| Check English links and anchors | `DOC_LANG=en pnpm check:links` |
| Check Chinese links and anchors | `DOC_LANG=zh pnpm check:links` |
| Run unit tests | `pnpm test` |
| Run TypeScript checks | `pnpm typecheck` |

`DOC_LANG` selects the locale. The repository enables pnpm pre/post scripts, so
normal start and build commands run `pnpm sync-skill` first. The strict link
commands build Nightly and every released documentation version from 1.0
onward.

Use pnpm. Dependency changes should update `pnpm-lock.yaml`; documentation-only
changes must not touch lockfiles.

## Repository layout

- `docs/`: English Nightly docs for unreleased changes.
- `versioned_docs/version-<version>/`: English docs for released versions.
- `i18n/zh/docusaurus-plugin-content-docs/current/`: Chinese Nightly docs.
- `i18n/zh/docusaurus-plugin-content-docs/version-<version>/`: Chinese released
  docs.
- `sidebars.ts`, `versioned_sidebars/`, and
  `i18n/zh/docusaurus-plugin-content-docs/*.json`: navigation.
- `variables/`: version-specific values for `VAR::<name>` placeholders.
- `src/`: Docusaurus components, theme overrides, plugins, and scripts.
- `skills/`: sources for published GreptimeDB agent skills.
- `static/`: images, downloads, and generated skill copies.
- `blog/`: release notes.

`versions.json` lists released documentation versions with the newest first.

## Add or update documentation

Use `docs/` and the Chinese `current/` tree for unreleased features. Update a
released version only when the change is valid for that GreptimeDB release.
Keep English and Chinese aligned in meaning, but write each language naturally.

New pages require front matter and an H1:

```markdown
---
keywords: [GreptimeDB, documentation]
description: A short description of the page.
---

# Page title
```

Add English Nightly pages to `sidebars.ts`. Update the corresponding
versioned sidebar or Chinese sidebar JSON when the same structural change
applies there.

When moving or deleting a page:

- Update every sidebar that references it.
- Update inbound links in the affected versions and languages.
- Preserve established routes or anchors when external links may depend on
  them.

Versioned docs are user-facing sources, not disposable generated files. When
creating a version, keep `versions.json`, `versioned_docs/`,
`versioned_sidebars/`, the matching Chinese directory and sidebar JSON, and
`variables/variables-<version>.ts` consistent.

## Reference snippets

Add an English Nightly category to `sidebars.ts`:

```typescript
{
  type: 'category',
  label: 'Category name',
  items: ['path/to/page'],
}
```

For Chinese navigation, add a matching translation to
`i18n/zh/docusaurus-plugin-content-docs/current.json`. The key must use the
English category label from `sidebars.ts`:

```json
{
  "sidebar.docs.category.Category name": {
    "message": "Translated category name",
    "description": "The label for category Category name in sidebar docs"
  }
}
```

Reuse Markdown content through an MDX import:

```mdx
import SharedContent from './shared-content.md'

<SharedContent />
```

Version variable filenames must match their documentation directories. For
example, pages under `versioned_docs/version-1.2/` use
`variables/variables-1.2.ts`; Nightly pages use
`variables/variables-nightly.ts`.

Add release notes under `blog/`. Follow the filename, front matter, and section
structure of the newest release note.

## Writing guidelines

- Use plain, direct English without marketing filler.
- Write Chinese naturally for Chinese developers; avoid literal translation.
- Keep commands, SQL, configuration keys, API names, and examples exact and
  copy-pasteable.
- State which release a version-specific feature or option applies to.
- Follow the terminology already used by the surrounding documentation.

## Links and anchors

Include the `.md` extension in links to documentation source files:

```markdown
[Ingest data](/user-guide/ingest-data/overview.md)
```

Root-relative documentation paths keep readers in their current documentation
version.

Read the source paragraph and destination section before changing a link. A
link can intentionally land on an overview or option section that sends readers
to a detailed page. A green link checker proves that the target exists, not
that it is the right target.

Heading slugs are public URLs. When a heading is renamed or translated but the
section still represents the same concept, preserve the established anchor
with the global `AnchorAlias` component:

```mdx
<AnchorAlias id="upload-a-pipeline" />

## Upload the Pipeline
```

Place the alias immediately before the exact heading it represents. Keep IDs
unique within the page. Do not import `AnchorAlias` in a document; it is
registered globally. Do not add or move an alias only to silence the checker.

Run both strict link commands after changing links, headings, routes, versions,
localization, or MDX anchor handling.

## Images and shared content

Put site assets under `static/` and reference them from the site root:

```markdown
![Diagram](/img/example.drawio.svg)
```

Use [`static/img/example.drawio.svg`](static/img/example.drawio.svg) as the
style reference for diagrams.

Docusaurus MDX supports shared Markdown imports and tabs. Reuse the existing
patterns near the page you are editing instead of introducing a second
convention.

## Variables and generated files

Use `VAR::<name>` for version-specific values. Define the value in the matching
file under `variables/`.

Do not edit generated outputs:

- Edit `skills/<name>/SKILL.md`, not `static/SKILL.md` or `static/skills/**`.
  `pnpm sync-skill` regenerates the static copies.
- Do not edit `build/`, `.docusaurus/`, or JavaScript transpiled from tracked
  TypeScript.
- Generate `docs/reference/sql/functions/df-functions.md` with
  `ruby src/misc/update_functions.rb`, then update the matching localized file.

## Backport Nightly changes

The backport script applies the last commit from the English and Chinese
Nightly trees to the latest released documentation version.

```shell
pnpm backport:dry
pnpm backport
```

Run the dry run first and inspect the result. The script cannot determine
whether a change is valid for the target release. Use `pnpm backport --help`
for additional options.

## Before opening a pull request

1. Review the complete diff for unintended versions, languages, generated
   files, and lockfile changes.
2. Run `git diff --check`.
3. Build each affected language.
4. Run both strict link commands for link, heading, route, version,
   localization, or MDX changes.
5. Run `pnpm test` and `pnpm typecheck` for components, plugins, theme, or
   configuration changes.
6. Check the rendered sidebar after navigation changes.
7. Use a [Conventional Commit](https://www.conventionalcommits.org/) style PR
   title and fill in the pull request template.

CI checks the build, unit tests, Markdown, spelling, front matter for
documentation pages, and the PR title. Build success does not replace manual
review of technical claims and link destinations.
