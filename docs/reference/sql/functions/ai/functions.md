---
keywords: [AI functions, ai_match, ai_choose, ai_score, natural-language matching, classification, scoring, JSONB]
description: Reference for ai_match, ai_choose, and ai_score, including signatures, criteria, return values, and SQL examples.
---

# Function Reference

This page describes the three AI functions for matching, classification, and
scoring. See the [AI Functions overview](./overview.md) for experimental
availability, configuration, NULL handling, and request limits.

## ai_match

`ai_match` estimates the probability that a natural-language statement holds for
text, using the Jev backend's Noul mode.

### Signature

```sql
ai_match(text, prompt)
```

| Argument | Type | Meaning |
| --- | --- | --- |
| `text` | `STRING` | Text to evaluate. |
| `prompt` | `STRING` | A statement or yes/no question about the text. |

**Return type:** nullable `DOUBLE` (`Float64`), in `[0, 1]`.

Higher probabilities indicate a stronger match. The result is not a similarity
score or the separate confidence field used by the Choice and Score modes.
Missing, nonnumeric, non-finite, or out-of-range probabilities fail the query.
If either argument is `NULL`, the result is `NULL` without an API call.

There is no threshold argument. Apply an ordinary SQL comparison to the result:
`ai_match(text, prompt) >= 0.8` includes a probability of exactly `0.8`.
Comparisons with `NULL` produce `NULL`, which `WHERE` excludes.

### Filter text

Using the [example data](./overview.md#example-data), find payment events that
still report failure after retries:

```sql
SELECT occurred_at, service, message
FROM ai_events
WHERE occurred_at >= '2026-09-19T00:00:00Z'
  AND occurred_at <  '2026-09-20T00:00:00Z'
  AND service = 'payments'
  AND ai_match(
    message,
    'The event reports that a payment still failed after retries.'
  ) >= 0.8
ORDER BY occurred_at;
```

The intended match is the first event. The second describes recovery, and the
NULL event makes no API request. Model results are not guaranteed to be identical
across evaluations.

### Return and rank probabilities

```sql
SELECT occurred_at, message,
       ai_match(message, 'The event reports that a payment still failed after retries.') AS probability
FROM ai_events
WHERE occurred_at >= '2026-09-19T00:00:00Z'
  AND occurred_at <  '2026-09-20T00:00:00Z'
  AND service = 'payments'
ORDER BY probability DESC NULLS LAST;
```

To also filter by this probability, [reuse a subquery alias](./overview.md#reuse-an-evaluation)
instead of repeating the AI call in `WHERE`.

## ai_choose

`ai_choose` classifies text into one of the supplied options, using the Jev
backend's Choice mode.

### Signature

```sql
ai_choose(text, prompt, criteria)
```

| Argument | Type | Meaning |
| --- | --- | --- |
| `text` | `STRING` | Text to classify. |
| `prompt` | `STRING` | Instructions for choosing an option. |
| `criteria` | `STRING` | JSON object defining 1–255 named options. |

**Return type:** nullable `STRING`, containing the selected option's **key**, not
its description. The function does not return the provider's confidence field.
A response whose selected key is not in the supplied criteria fails the query.

If any argument is SQL `NULL`, the result is `NULL` without criteria validation
or an API call.

### Criteria

Each key is an option name. Its value must be a description expressed as a JSON
string, object, or array, or JSON `null` when the option name is sufficient:

```json
{
  "billing": "Payments, invoices, and refunds",
  "technical": {"description": "Bugs and outages", "examples": ["crash", "timeout"]},
  "other": null
}
```

An empty object, more than 255 options, invalid JSON, or a number or Boolean used
as an option's description is invalid. JSON `null` as an option description does
not make the SQL argument NULL: `'{"other":null}'` is valid criteria, while the
string `'null'` is not a criteria object.

### Example

After creating the [example data](./overview.md#example-data), route events to a team:

```sql
SELECT occurred_at, message,
       ai_choose(message, 'Which team should handle this event?',
                 '{"billing":"Payments and refunds","technical":"Bugs and outages","other":null}') AS team
FROM ai_events
WHERE occurred_at >= '2026-09-19T00:00:00Z'
  AND occurred_at <  '2026-09-20T00:00:00Z';
```

The result for each non-null row is one of `billing`, `technical`, or `other`.
Use the result in string comparisons or grouping. To both return and filter by
the label, [reuse a subquery alias](./overview.md#reuse-an-evaluation) rather than
writing the AI call twice.

## ai_score

`ai_score` rates text against ordered levels, using the Jev backend's Score mode.
It returns a structured result from one model evaluation, not just a numeric
score.

### Signature

```sql
ai_score(text, prompt, criteria)
```

| Argument | Type | Meaning |
| --- | --- | --- |
| `text` | `STRING` | Text to rate. |
| `prompt` | `STRING` | Instructions for rating the text. |
| `criteria` | `STRING` | JSON array defining 2–10 ordered levels, from low to high. |

**Return type:** nullable JSONB object, represented internally as `BinaryView`.
Use [JSON functions](../json.md) to display or extract its fields.

If any argument is SQL `NULL`, the result is `NULL` without criteria validation
or an API call.

### Criteria

Each array element describes a level using a JSON string, object, or array.
Levels are numbered from zero in the supplied order. For example:

```json
["No impact", {"description": "Degraded service with a workaround"}, ["Blocking issue", "No workaround"]]
```

For these three levels, the score ranges from `0` to `2`, not from `0` to `1`.
An array with fewer than 2 or more than 10 levels is invalid. Unlike
`ai_choose`, level descriptions cannot be JSON `null`; numbers and Booleans are
also invalid description types.

### Result

An illustrative result for three levels is:

```json
{
  "score": 1.05,
  "confidence": 0.92,
  "probabilities": [0.0, 0.95, 0.05]
}
```

| Field | Meaning |
| --- | --- |
| `score` | The provider's probability-weighted mean of level numbers, in `[0, N - 1]` for N levels. It may be fractional. |
| `confidence` | The provider's confidence in `[0, 1]`, reflecting distribution concentration, not a guarantee of correctness. |
| `probabilities` | An array of exactly N probabilities in criteria order. Entry `i` corresponds to `criteria[i]`; these are individual, not cumulative, probabilities. |

The same mean can hide different judgments: `[0, 1, 0]` and `[0.5, 0, 0.5]` both
have score `1`, but the first concentrates on the middle level while the second
is split between the extremes. Inspect the confidence and distribution before
treating the score as a definite level.

The response must include all three fields. Score and confidence must be finite
numbers in their respective ranges; every level probability must be numeric and
in `[0, 1]`, and their sum must be within `1e-6` of 1. Missing levels or invalid
values fail the query. GreptimeDB preserves the provider's numeric values without
renormalizing the distribution or recomputing the score.

### Extract fields and filter

Using the [example data](./overview.md#example-data), evaluate each event once,
then extract fields and filter by confidence:

```sql
SELECT occurred_at, message,
       json_get_float(rating, 'score') AS severity,
       json_get_float(rating, 'confidence') AS confidence,
       json_get_float(rating, 'probabilities[2]') AS blocking_probability
FROM (
    SELECT occurred_at, message,
           ai_score(message, 'How severe is this event?',
                    '["No impact","Degraded service with a workaround","Blocking issue with no workaround"]') AS rating
    FROM ai_events
    WHERE occurred_at >= '2026-09-19T00:00:00Z'
      AND occurred_at <  '2026-09-20T00:00:00Z'
) AS rated
WHERE json_get_float(rating, 'confidence') >= 0.8
ORDER BY severity DESC NULLS LAST;
```

Use `json_to_string(rating)` in the outer query to display the full object.
Reusing `rating` ensures all extracted fields come from the same evaluation;
repeating `ai_score(...)` for each field makes separate API calls. See
[Reuse an evaluation](./overview.md#reuse-an-evaluation).
