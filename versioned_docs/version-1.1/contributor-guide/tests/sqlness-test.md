---
keywords: [SQL tests, sqlness, test suite, test cases, test output]
description: Instructions for running SQL tests in GreptimeDB using the `sqlness` test suite, including file types, case organization, and running tests.
---

# Sqlness Test

## Introduction

SQL is an important user interface for `GreptimeDB`. We have a separate test suite for it (named `sqlness`).

## Sqlness manual

### Case file

Sqlness has two types of file

- `.sql`: test input, SQL only
- `.result`: expected test output, SQL and its results

The `.result` file is the expected execution output. If you see `.result` files changed,
it means the test gets a different result and indicates it may fail. You should
check the change logs to solve the problem.

You only need to write test SQL in the `.sql` file, and run the test.

### Case organization

The root dir of input cases is `tests/cases`. It contains several sub-directories stand for different test
modes. E.g., `standalone/` contains all the tests to run under `greptimedb standalone start` mode.

Under the first level of sub-directory (e.g. the `cases/standalone`), you can organize your cases as you like.
Sqlness walks through every file recursively and runs them.

## Run the test

Unlike other tests, this harness is in a binary target form. You can run it with

```shell
cargo run --bin sqlness-runner bare
```

It automatically finishes the following procedures: compile `GreptimeDB`, start it, grab tests and feed it to
the server, then collect and compare the results. You only need to check whether any `.result` files changed.
If not, congratulations, the test is passed 🥳!

### Run a specific test

```shell
cargo sqlness bare -t your_test
```

The `-t` or `--test-filter` option accepts a regex string. Sqlness examines case names in the format of `env:case`.
