---
keywords: [SQL tests, sqlness, test suite, test cases, test output]
description: Instructions for running SQL tests in GreptimeDB using the `sqlness` test suite, including file types, case organization, and running tests.
---

# Sqlness Test

## Introduction

Sqlness is GreptimeDB's end-to-end regression suite for SQL and protocol behavior. A case sends statements to a running GreptimeDB instance and compares the output with a checked-in result file.

## Sqlness manual

### Case file

Each case uses two files:

- `.sql`: test input, SQL only
- `.result`: expected test output, SQL and its results

Write the input in the `.sql` file and run the test to generate or update `.result`. Review every result diff: accept it only when the behavior change is intended.

### Case organization

Input cases live under `tests/cases`. The first directory level selects an environment. For example, `standalone/` runs against a standalone GreptimeDB instance.

Within an environment, group a new case with the feature it exercises. Sqlness discovers case files recursively.

## Run the test

Run the suite with:

```shell
cargo sqlness bare
```

The command builds and starts GreptimeDB, runs the selected cases, and compares their output. A changed `.result` file is part of the review, not proof that the new output is correct.

### Run a specific test

```shell
cargo sqlness bare -t your_test
```

The `-t` or `--test-filter` option accepts a regex string. Sqlness examines case names in the format of `env:case`.
