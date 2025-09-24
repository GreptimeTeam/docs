# Contributing to GreptimeDB Docs

Thank you for your interest in contributing to the GreptimeDB Docs repository!
We appreciate your involvement in this open-source project and welcome contributions from the community.

## How to contribute

We welcome contributions to the GreptimeDB Docs repository in the following ways:

- Submit an issue to report a problem or suggest an improvement.
- Submit a pull request to add new documents.


## Project structure

This project uses [Docusaurus](https://docusaurus.io/) as the documentation framework,
following its architecture principles and guidelines.

```
docs/
├── blog
│   ├── release-0-9-1.md
│   ├── release-0-9-2.md
├── docs
│   ├── getting-started
│   │   ├── overview.md
│   │   └── ...
│   ├── user-guide
│   └── ...
├── versioned_docs
│   ├── version-0.9
│   └── ...
├── sidebars.ts
├── i18n
│   └── zh
│       └── docusaurus-plugin-content-docs
│           ├── current
│           ├── version-0.9
│           ├── current.json
│           ├── version-0.9.json
│           └── ...
├── src
│   ├── css
│   │   └── custom.css
│   └── plugins
│       └── variable-placeholder.ts
├── variables
│   ├── variables-0.9.ts
│   ├── variables-nightly.ts
│   └── ...
├── static
│   └── img
├── docusaurus.config.ts
├── package.json
├── README.md
└── pnpm-lock.yaml
```
### Key Directories and files

- `/blog/` - Markdown files for release notes.
- `/docs/` - Documentation files for the nightly version.
- `sidebars.ts` - Configuration file for the navigation sidebar metadata for the nightly version of the documentation.
- `/versioned_docs/` - Documentation files for older versions.
- `/versioned_docs` - Markdown files for the documentation of old versions.
- `/versioned_sidebars` - Configuration file for the navigation sidebar metadata of the documentation of old versions.
- `/i18n/zh/docusaurus-plugin-content-docs` - Localized documentation Markdown files for the Chinese language.
  - `/current/` - Nightly version of the localized documentation.
  - `/version-<doc-version>` - Localized documentation for the specified version.
  - `/current.json` - Navigation sidebar metadata for the nightly version of the localized documentation.
  - `/version-<doc-version>.json` - Navigation sidebar metadata for the specified version of the localized documentation.
- `/src/plugins/variable-placeholder.ts` - Custom plugin that replaces variables in the documentation.

## Documentation Versioning

Documentation versions align with GreptimeDB versions:

- **Nightly version**: Unreleased features.
- **Versioned docs**: Stable releases (e.g., v0.9, v0.10) that include all features up to the specified version.


## Adding a new document

### English documents

- Add new documents to the `./docs` directory for the nightly version.
- Ensure the document's H1 header is the title, which will be used in the sidebar.
- Update `sidebars.ts` to include the new document:

```ts
{
  type: 'category',
  label: '<Navigation name>',
  items: [
    'user-guide/manage-data/overview',
    '<your file path>',
    '...',
  ],
},
```

### Localized documents

* Add new localized documents under ./i18n/<locale>/docusaurus-plugin-content-docs/current.
* Follow the same guidelines as for English documents, that the H1 header is the title, which will be used in the sidebar.
* If adding a new directory, update current.json for translations:

```
"sidebar.docs.category.<category-label>": {
  "message": "<The localized label for the category, for example, 管理数据>",
  "description": "Description"
},
```

## Adding a new release note

Add a new Markdown file to the `/blog` dictionary.
The content structure should remain consistency as the previous release notes.

## Modifying existing documents

- English documents: Modify documents in `./docs` and ensure consistency across all relevant versions in `./versioned_docs`.
- Localized documents: Modify localized documents in `./i18n/<locale>/docusaurus-plugin-content-docs/<version>` and ensure consistency across versions.

### Updating `df-functions.md`

Use the following command to generate `./docs/reference/sql/functions/df-functions.md`.

```shell
ruby src/misc/update_functions.rb
```

Then copy the English content to the corresponding localized file.

## Deleting documents

- English documents: Remove the document and update the `sidebars.ts` configuration.
- Localized documents: Remove the document and update the corresponding json file of the sidebar configuration.

## Images

### Adding images

Place images in the `./static/img` directory and reference them with a relative path:

```markdown
![image](/img/xxx.png)
```

### Image style

Please use the [`example.drawio.svg`](static/img/example.drawio.svg) template for diagrams, maintaining consistency in colors and style.

## Markdown links

Relative path and absolute path are both supported in the markdown links.
The absolute file paths are resolved relative to the content root, usually `docs/` or localized ones like `i18n/<localize>/plugin-content-docs/current`.

For example, link to the `Ingest Data` document in the `./docs` directory:

```markdown
[Ingest Data](/user-guide/ingest-data/overview.md)
```

Always use the `.md` extension when linking to other documentation files.
This ensures that the files are correctly linked to the corresponding version.
For example, use `[Ingest Data](/user-guide/ingest-data/overview.md)` instead of `[Ingest Data](/user-guide/ingest-data/overview)`.

## Using tabs

You can the `Tabs` component to display different content in the same position.
Please refer to the [Docusaurus documentation](https://docusaurus.io/docs/markdown-features/tabs) for more information.

## Variable Placeholders

You can utilize variable placeholders in the documentation to replace the variables with actual values.
These placeholders are defined in the `./variables` directory.
The variable file name must match the version name in the `versioned_docs` directory.
For instance, `version-0.9` should have a corresponding `variables-0.9.ts` file.

To use a variable placeholder in the documentation, follow this syntax:

```markdown
VAR::<variableName>
```

Add the variable name to the corresponding variable file:

```ts
export const variables = {
  // ...
  variableName: 'name',
  // ...
};
```

For a practical example, please refer to the [GreptimeDB Standalone installation document](docs/getting-started/installation/greptimedb-standalone.md#linux-and-macos).

## Include other Markdown files

You can include other Markdown files in the current Markdown file.
For example, if you want to include the `shared-content.md` file in the current file, you can use the following code:

```markdown
import IncludesharedContent from './shared-content.md'
<IncludesharedContent/>
```

## Document templates

Document templates can help you reuse the same outlines and structures in multiple documents. For example, you can create a template file for all SDK documents and only write the SDK-specific content in each individual SDK document.

For an example, please refer to the [gRPC-SDK dictionary](docs/user-guide/ingest-data/for-iot/grpc-sdks).

## Build and preview the docs locally

We highly encourage you to preview your changes locally before submitting a pull request.
This project requires Node.js version 18.0.0 or higher.
Use `npm install -g pnpm` to install package manager, and start a local server with the following commands:

```shell
pnpm install
pnpm run start
```

You can also use `pnpm run build` to check dead links.

### Preview the localized documentation

To preview the documentation in a specific language, use command `pnpm run start --locale <localize language>`.
For example:

```cmd
DOC_LANG=zh pnpm start
```

## PR title check

We use [action-semantic-pull-request](https://github.com/amannn/action-semantic-pull-request) to ensure that PR titles follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## Backport nightly changes to versioned docs

Some doc modifications on latest nightly (current) are required to backport to
released docs. We created a script to simplify this process.

To backport the changes, first commit your changes on nightly docs. Then execute

```sh
pnpm run backport
```

This command will apply all the changes from git `HEAD~1` to last release
versioned docs. Then are several options to customize this behavior

```sh
pnpm run backport --help
```

Note that we cannot guarantee success of this command because sometimes there
are more changes to versioned docs that blocks us from apply it. You will need
to resolve the conflicts manually.
