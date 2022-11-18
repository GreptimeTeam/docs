# Contributing to GreptimeDB Docs

- Use relative path for internal link
- Append your page to `summary.yml`
- Use `-` and lowercase in file names

## PR Title Check

We require pull request title to start with [these
keywords](https://github.com/GreptimeTeam/docs/pull/4/files#diff-778d6d6e6107ef54c50c49b37df09a4a21b2e42e8a6623aaa24888fa16bc1551R7)

## Markdown Lint

We use [markdownlint-cli](https://github.com/DavidAnson/markdownlint) to check
format of markdown files. You can do it locally with:

```console
markdownlint -c .markdownlint.yaml **/*.md
```
