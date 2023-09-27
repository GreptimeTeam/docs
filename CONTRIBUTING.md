# Contributing to GreptimeDB Docs

## File Structure

This project uses markdown files to generate a documentation website.
All markdown files are located in the `docs` directory.

- The version directories in `/docs` match the [GreptimeDB](https://github.com/GreptimeTeam/greptimedb) version.
For example, `/docs/v0.4` contains the documentation for GreptimeDB v0.4.
- The file `summary.yml` defines the navigation of the documentation website.
It should match the current document structure.
You need to use `-` and lowercase letters in markdown file names so that `summary.yml` can recognize these file names.

### Chinese Documentation

- The Chinese documentation is located in `/docs/zh` directory.
- The file `summary-i18n.yml` in `/docs/zh` directory defines the navigation of the Chinese documentation website. 
The content in `summary-i18n.yml` is the Chinease name of the relative directory.
If you add a new directory in `/docs/zh`, remember to update `summary-i18n.yml`.

## Links

- Use relative paths for internal links whenever possible.
- Reference files placed in `public` using root absolute path - for example, `public/icon.png` should always be referenced in source code as `/icon.png`.

## Style Guide

Please use [`example.drawio.svg`](docs/example.drawio.svg) as a template for drawing diagrams.
You can install the Draw.io Integration for VS Code and create a new diagram from the template.

If there is no suitable graphics, you can use other graphics,
but the colors should be consistent with the template.

## Markdown Lint

We use [markdownlint-cli](https://github.com/DavidAnson/markdownlint) to check
format of markdown files. You can do it locally with:

```shell
markdownlint -c .markdownlint.yaml **/*.md
```

You can also use markdownlint extension if you are using VS Code.

## Build and preview the docs locally

We highly encourage you to preview your changes locally before submitting a pull request.
This project requires Node.js version 18.0.0 or higher.
Use the following commands to start a local server:

```shell
npm install
npm run dev
```

You can also use `npm run build` to check dead links.

## PR Title Check

We require pull request title to start with [these
keywords](https://github.com/GreptimeTeam/docs/pull/4/files#diff-778d6d6e6107ef54c50c49b37df09a4a21b2e42e8a6623aaa24888fa16bc1551R7)
