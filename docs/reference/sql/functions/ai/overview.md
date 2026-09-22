---
keywords: [AI functions, natural-language matching, classification, scoring, SQL functions, Jev, TypeSafe]
description: Configure and use experimental AI functions for natural-language matching, classification, and scoring in GreptimeDB.
---

# AI Functions

AI functions evaluate text against natural-language prompts. The SQL names are
provider-neutral; the current backend is [TypeSafe's Jev model](https://docs.typesafe.ai/introduction).

| Function | Purpose | Return value |
| --- | --- | --- |
| [`ai_match(text, prompt)`](./ai-match.md) | Estimate whether a statement holds for the text | `DOUBLE` probability in `[0, 1]` |
| [`ai_choose(text, prompt, criteria)`](./ai-choose.md) | Classify text into one of the supplied options | `STRING` containing the selected option name |
| [`ai_score(text, prompt, criteria)`](./ai-score.md) | Rate text against ordered levels | JSONB object with `score`, `confidence`, and `probabilities` |

:::warning Experimental availability
These functions are experimental and may change. They are available in builds
containing [GreptimeDB PR #9300](https://github.com/GreptimeTeam/greptimedb/pull/9300).
They replace the unreleased `jev(text, statement, threshold)` API; `jev` is no
longer registered. Use `ai_match(text, prompt) >= threshold` for Boolean filtering.
:::

## Enable API evaluation

The **default-enabled Cargo feature `ai_functions`** compiles and registers all
three functions. It does not automatically permit external API calls. Enable
the Jev backend separately in the GreptimeDB process:

```shell
export GREPTIMEDB_EXPERIMENTAL_JEV=true
export JEV_API_KEY='<your TypeSafe API key>'
cargo run -p cmd -- standalone start
```

Run this command from a GreptimeDB source checkout containing the implementation.
To enable the Cargo feature explicitly, use `--features ai_functions` before `--`.
The runtime variables retain their Jev names even though the SQL names are now
provider-neutral.

| Environment variable | Default | Description |
| --- | --- | --- |
| `GREPTIMEDB_EXPERIMENTAL_JEV` | Disabled | Set to `true` to permit API evaluation. |
| `JEV_API_KEY` | None | TypeSafe API key, required when evaluating non-null inputs. |
| `JEV_MODEL` | `jev-latest` | Model name sent to TypeSafe. |
| `JEV_ENDPOINT` | `https://api.typesafe.ai/v1/systemone` | Full HTTP evaluation endpoint URL. |

The MVP uses environment variables, not a TOML configuration section. Pass them
to the server process; changing another terminal's environment does not update a
running server. Keep the API key in the server environment, not in SQL.

:::warning External data transfer
The text, prompt, and any criteria supplied to these functions are sent to the
configured endpoint. Only use data that you are permitted to send to that service.
:::

## Arguments and NULL handling

All arguments are SQL strings and can be literals or column expressions.
`text` is sent as the API's `state`, and `prompt` as the question's `instructions`.
For several input fields, combine them explicitly, for example
`concat(service, ': ', message)`. Parentheses around `(message)` do not create a
row tuple.

`ai_choose` and `ai_score` accept criteria encoded as a **JSON string**, not a
JSONB value. Criteria may vary per row. Constant criteria are parsed once and
shared within each batch.

If any argument is SQL `NULL`, that row returns SQL `NULL` without validating
its criteria or making an API request. A batch in which every row is skipped
does not require the runtime switch or an API key. For example, this returns
`NULL` even though the criteria string is invalid:

```sql
SELECT ai_choose(NULL, 'Route the ticket', 'invalid JSON');
```

## Example data

The function pages use this small synthetic dataset. Quote `service` and `message`
in the table definition because the parser treats them as keywords:

```sql
CREATE TABLE ai_events (
    occurred_at TIMESTAMP TIME INDEX,
    "service" STRING,
    "message" STRING,
    PRIMARY KEY ("service")
);

INSERT INTO ai_events VALUES
    ('2026-09-19T01:00:00Z', 'payments',
     'Payment failed permanently: all three retries exhausted; the payment is still unsuccessful.'),
    ('2026-09-19T02:00:00Z', 'payments',
     'Payment succeeded on the second retry; the payment is complete.'),
    ('2026-09-19T03:00:00Z', 'payments', NULL);
```

Model judgments can vary with the input and model version. After trying the
examples, remove the table with `DROP TABLE ai_events;`.

## Reuse an evaluation

AI functions are volatile: they are not evaluated as constants during planning,
and identical calls written separately in `SELECT` and `WHERE` are evaluated
separately. If a filter evaluates N non-null rows and M rows pass to the
projection, this can produce N + M requests, reaching 2N when every row passes.

To filter, return, and rank the same result, compute it once in a subquery and
reuse its alias:

```sql
SELECT occurred_at, message, probability
FROM (
    SELECT occurred_at, message,
           ai_match(message, 'The event reports that a payment still failed after retries.') AS probability
    FROM ai_events
    WHERE occurred_at >= '2026-09-19T00:00:00Z'
      AND occurred_at <  '2026-09-20T00:00:00Z'
      AND service = 'payments'
) AS matched
WHERE probability >= 0.8
ORDER BY probability DESC;
```

The same pattern applies to `ai_choose` and `ai_score`. Extract multiple fields
from an aliased `ai_score` result instead of invoking the model again for each
field. This reuses the result within the query, not across queries.

## Errors and MVP limits

- Each evaluated non-null row makes one HTTP request **per function invocation**.
  Different functions do not share or combine requests. There is no cross-query cache.
- Criteria for all non-null rows are validated before any requests for that batch
  are sent. Invalid JSON, description types, or option/level counts fail locally.
- Network errors, timeouts, HTTP errors (including `429` and `529`), invalid JSON,
  and invalid answers fail the query. They do not become `NULL`, and there is no
  automatic retry or backoff. Each response must have the requested question type
  and satisfy the value constraints on the function's reference page.
- At most eight requests run concurrently **per expression/batch invocation**,
  with a 30-second timeout per request. This is not a per-query or process-wide
  limit; concurrent partitions and queries can produce more in-flight requests.
- Ordinary SQL filters can narrow the candidate data, but predicates are not
  guaranteed to run in SQL text order. `LIMIT` is not a hard cap on API requests.
  Start with small, time-bounded queries.
- The default alias `jev-latest` can change over time. Use `JEV_MODEL` to select a
  model version supported by the service when you need a fixed version.
- Real-service end-to-end validation targets standalone. Distributed use requires
  a feature-enabled binary and the appropriate environment on every evaluating
  node, plus separate real-service validation.

For the backend protocol, see the [TypeSafe HTTP API reference](https://docs.typesafe.ai/api).
