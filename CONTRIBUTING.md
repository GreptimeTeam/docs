# Contributing to GreptimeDB Docs

## File structure

This project uses markdown files to generate a documentation website.
All markdown files are located in the `docs` directory.

- The version directories in `/docs` match the [GreptimeDB](https://github.com/GreptimeTeam/greptimedb) version.
For example, `/docs/v0.4` contains the documentation for GreptimeDB v0.4.
- The file `summary.yml` defines the navigation of the documentation website.
It should match the current document structure.
You need to use `-` and lowercase letters in markdown file names so that `summary.yml` can recognize these file names.

### Document localization

- The localized documentation is located in the `/docs/xx` directory, where `xx` is the language code.
- The `summary-i18n.yml` file in the `/docs/xx` directory defines the navigation of the localized documentation website.
The content in `summary-i18n.yml` should be the localized name of the relative directory.
If you add a new directory in `/docs/xx`, remember to update `summary-i18n.yml`.

### Links

- Reference files placed in `public` using root absolute path - for example, `public/icon.png` should always be referenced in source code as `/icon.png`.

## Write documentation

### Update `df-functions.md`

Use the following command to generate `/en/reference/sql/functions/df-functions.md`:

```shell
ruby misc/update_functions.rb [nightly | v0.x]
```

Then copy the English content to the corresponding localized file and translate it.

## Style guide

### Image style

Please use [`example.drawio.svg`](docs/example.drawio.svg) as a template for drawing diagrams.
You can install the Draw.io Integration for VS Code and create a new diagram from the template.

If there is no suitable graphics, you can use other graphics,
but the colors should be consistent with the template.

### Markdown lint

We use [markdownlint-cli](https://github.com/DavidAnson/markdownlint) to check
format of markdown files. You can do it locally with:

```shell
markdownlint -c .markdownlint.yaml **/*.md
```

You can also use markdownlint extension if you are using VS Code.

## Build and preview the docs locally

We highly encourage you to preview your changes locally before submitting a pull request.
This project requires Node.js version 18.0.0 or higher.
Use `npm install -g pnpm` to install package manager, and start a local server with the following commands:

```shell
pnpm install
pnpm run dev
```

You can also use `pnpm run build` to check dead links.

### Preview the localized documentation

To preview the documentation in a specific language,
add a new file called `.env` to the root directory and include the `VITE_LANG=xx` environment variable,
where `xx` is the language code.
For example, to preview the Chinese documentation, add the following content to `.env`:

```shell
VITE_LANG=zh
```

Then start a local server with `pnpm run dev`.

## PR title check

We use [action-semantic-pull-request](https://github.com/amannn/action-semantic-pull-request) to ensure that PR titles follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

