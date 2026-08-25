---
keywords: [SQL tests, sqlness, golden files, standalone, distributed]
description: Add and run sqlness regression cases for user-visible query behavior.
---

# Sqlness Test

## Introduction

Sqlness is GreptimeDB's golden-file test harness for SQL and query behavior. It builds and starts the requested GreptimeDB environment, executes case files, and compares the output with checked-in results. The harness and its current options are documented in [`tests/README.md`](https://github.com/GreptimeTeam/greptimedb/blob/main/tests/README.md).

## Sqlness manual

### Case file

Each case has two files:

- `.sql` contains the statements and sqlness directives.
- `.result` contains the expected statements and output.

Edit the `.sql` input first, run sqlness, and review the resulting `.result` diff. A changed result can be the intended new behavior or a regression; the harness cannot decide which one. Commit a result change only after checking every changed row and error message.

### Case organization

Cases live under `tests/cases/`. The first directory level selects an environment, such as `standalone/`; directories below it organize related cases. Sqlness discovers case files recursively.

Place a regression in the environment where the behavior is observable. Distributed planning, routing, and multi-node metadata behavior require a distributed case even when an equivalent standalone query also succeeds.

## Run the test

The repository defines a cargo alias for the harness:

```shell
cargo sqlness bare
```

This command builds GreptimeDB, starts the test environment, runs the cases, and updates or compares `.result` files. Inspect both the command result and `git diff`.

### Run a specific test

```shell
cargo sqlness bare -t 'standalone:your_case'
```

`-t`/`--test-filter` accepts a regular expression and matches case names in `env:case` form. Use a narrow filter while iterating, then run the affected environment or full suite before submission.
