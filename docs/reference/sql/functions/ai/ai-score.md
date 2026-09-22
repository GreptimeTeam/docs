---
keywords: [ai_score, AI functions, rating, confidence, probability distribution, JSONB]
description: Use ai_score to rate text against ordered criteria and extract the score, confidence, and level probabilities from JSONB.
---

# ai_score

`ai_score` rates text against ordered levels, using the Jev backend's Score mode.
It returns a structured result from one model evaluation, not just a numeric
score. See the [AI Functions overview](./overview.md) for experimental availability,
configuration, NULL handling, and request limits.

## Signature

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

## Criteria

Each array element describes a level using a JSON string, object, or array.
Levels are numbered from zero in the supplied order. For example:

```json
["No impact", {"description": "Degraded service with a workaround"}, ["Blocking issue", "No workaround"]]
```

For these three levels, the score ranges from `0` to `2`, not from `0` to `1`.
An array with fewer than 2 or more than 10 levels is invalid. Unlike
`ai_choose`, level descriptions cannot be JSON `null`; numbers and Booleans are
also invalid description types.

## Result

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

## Extract fields and filter

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
