---
keywords: [Jev, natural-language filtering, semantic filtering, SQL functions, TypeSafe]
description: Use the experimental Jev SQL function to filter text with a natural-language condition and a probability threshold.
---

# Jev Natural-Language Filtering

`jev(text, statement, threshold)` uses [TypeSafe's Jev model](https://docs.typesafe.ai/introduction)
to judge whether a natural-language condition holds for a text value. It returns
a Boolean and can be used in `WHERE` or `SELECT`.

:::note Experimental availability
This function is included by the **default-enabled Cargo feature `ai-functions`**
in builds containing the Jev implementation. External API evaluation still
requires the runtime switch and an API key.
The implementation is tracked in
[GreptimeDB PR #9265](https://github.com/GreptimeTeam/greptimedb/pull/9265).
:::

## Enable Jev

In a GreptimeDB source checkout that includes this feature, set the server's
environment variables and start a feature-enabled standalone instance:

```shell
export GREPTIMEDB_EXPERIMENTAL_JEV=true
export JEV_API_KEY='<your TypeSafe API key>'
cargo run -p cmd -- standalone start
```

There are two separate gates:

- The Cargo feature `ai-functions`, enabled by default, compiles and registers the SQL function.
- `GREPTIMEDB_EXPERIMENTAL_JEV=true` permits the compiled function to call the API.

Default builds register `jev()`, but do not automatically permit external API
calls. To enable the Cargo feature explicitly, use `--features ai-functions`.
The environment must belong to the GreptimeDB process; changing another
terminal's environment does not update a running server.

| Environment variable | Default | Description |
| --- | --- | --- |
| `GREPTIMEDB_EXPERIMENTAL_JEV` | Disabled | Set to `true` to permit API evaluation. |
| `JEV_API_KEY` | None | TypeSafe API key, required when evaluating non-null inputs. |
| `JEV_MODEL` | `jev-latest` | Model name sent to TypeSafe. |
| `JEV_ENDPOINT` | `https://api.typesafe.ai/v1/systemone` | Full HTTP evaluation endpoint URL. |

The MVP uses these environment variables rather than a TOML configuration section.
Keep the API key in the server environment rather than embedding it in SQL.

## Signature

```sql
jev(text, statement, threshold)
```

**Return type:** nullable `BOOLEAN`.

| Argument | Type | Meaning |
| --- | --- | --- |
| `text` | String | Text to evaluate, passed as the API's `state`. |
| `statement` | String | A statement or yes/no question, passed as a Noul question's `instructions`. |
| `threshold` | `DOUBLE` | A finite number in `[0, 1]`. |

For non-null arguments, the function returns `true` when the returned Noul
probability is **greater than or equal to** `threshold`, and `false` otherwise.
For example, a probability of `0.8` matches a threshold of `0.8`.

The threshold applies to the probability that the condition is true. It is not
a similarity score or the separate confidence field returned by TypeSafe's Choice
and Score primitives. The SQL function returns only the Boolean result, not the
raw probability.

If any argument is `NULL`, the result is `NULL` and that row makes no API request.
`WHERE` excludes both `false` and `NULL` results. A batch containing only null
inputs does not require an API key or the runtime switch.

The first argument is a single string expression. `(message)` is just a
parenthesized expression, not a row tuple. To include several fields, combine them
explicitly, for example `concat(service, ': ', message)`.

## Example

Create a table and insert synthetic payment events. Quote `service` and `message`
in the table definition because they are SQL keywords:

```sql
CREATE TABLE jev_events (
    occurred_at TIMESTAMP TIME INDEX,
    "service" STRING,
    "message" STRING,
    PRIMARY KEY ("service")
);

INSERT INTO jev_events VALUES
    ('2026-09-19T01:00:00Z', 'payments',
     'Payment failed permanently: all three retries exhausted; the payment is still unsuccessful.'),
    ('2026-09-19T02:00:00Z', 'payments',
     'Payment succeeded on the second retry; the payment is complete.'),
    ('2026-09-19T03:00:00Z', 'payments', NULL);

SELECT occurred_at, service, message
FROM jev_events
WHERE occurred_at >= '2026-09-19T00:00:00Z'
  AND occurred_at <  '2026-09-20T00:00:00Z'
  AND service = 'payments'
  AND jev(
    message,
    'The event reports that a payment still failed after retries.',
    0.8
  )
ORDER BY occurred_at;
```

The intended match is the first event: payment remains unsuccessful after all
retries. The second event reports recovery, and the null event is excluded without
an API call. Model judgments can vary with the input and model version.

To inspect the Boolean judgment per row, put `jev(...) AS matched` in the `SELECT`
list instead of using it as a filter. Running another query evaluates the text
again; results are not cached across queries.

Clean up the example table when finished:

```sql
DROP TABLE jev_events;
```

## Errors and MVP limits

- Non-null rows with thresholds outside `[0, 1]`, including NaN and infinity,
  fail locally before any requests for that batch are sent.
- Each evaluated non-null row makes a separate HTTP request. Text is sent to the
  configured external endpoint using Bearer authentication.
- At most eight requests run concurrently **per expression/batch invocation**,
  with a 30-second timeout per request. This is not a per-query or process-wide
  limit; concurrent partitions and queries can produce more in-flight requests.
- Network errors, timeouts, HTTP errors (including `429` and `529`), invalid JSON,
  and malformed or out-of-range Noul answers fail the query. They do not become
  `false` or `NULL`. There is no automatic retry or backoff.
- Ordinary SQL filters can narrow the candidate data, but predicate evaluation
  is not guaranteed to follow SQL text order. `LIMIT` is not a hard cap on API
  requests. Start with small, time-bounded queries.
- The default model alias `jev-latest` can change over time. Use `JEV_MODEL` to
  select a version supported by the service when you need a fixed model version.
- Real-service end-to-end validation targets standalone. Distributed use requires
  a feature-enabled binary and the appropriate environment on every evaluating
  node, as well as separate real-service validation.

For request and response details, see the
[TypeSafe HTTP API reference](https://docs.typesafe.ai/api) and
[Noul documentation](https://docs.typesafe.ai/primitives/noul).
