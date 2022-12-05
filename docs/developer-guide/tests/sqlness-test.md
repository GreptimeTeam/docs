# Sqlness Test

## Introduction
SQL is an important user interface for `GreptimeDB`. We have a separate test suite for it (named `sqlness`).

## Sqlness manual

### Case file
Sqlness has three types of file
- `.sql`: Test input, SQL only
- `.result`: Expected test output, SQL and its result
- `.output`: Different output, SQL and its result

Both `.result` and `.output` are output (execution result) files. The different is that `.result` is the
standard (expected) output, and `.output` is the error output. Therefore, finding `.output` files generated
after you run the test means this test gets a different result and indicates the test fails. You should
check your change to solve the problem.  

You only need to write your test SQL in `.sql` file, and run the test. On the first run it will produce
an `.output` file because there is no `.result` to compare with. If you can make sure the content in
`.output` is correct, you can rename it to `.result`, which means it's the expected output.

And at any time there should only be two file types, `.sql` and `.result` -- otherwise, an existing `.output`
file means your test fails. That's why we don't ignore `.output` file in `.gitignore`, we should track
it and make sure it doesn't exist.

### Case organization
The root dir of input cases is `tests/cases`. It contains several sub-directories stand for different test
modes. E.g., `standalone/` contains all the tests to run under `greptimedb standalone start` mode.

Under the first level of sub-directory (e.g. the `cases/standalone`), you can organize your cases as you like.
Sqlness will walk through every file recursively and run them.

## Run the test
Unlike other tests, this harness is in a binary target form. You can run it with
```shell
cargo run --bin sqlness-runner
```
It will automatically finish the following procedures: compile `GreptimeDB`, start it, grab tests and feed it to
the server, then collect and compare the result. You only need to check whether there are new `.output` files.
If not, congratulations, the test is passed 🥳!