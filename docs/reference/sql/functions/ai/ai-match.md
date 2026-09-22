---
keywords: [ai_match, AI functions, natural-language matching, probability, semantic filtering]
description: Use ai_match to return a natural-language matching probability for filtering, projection, and ranking.
---

# ai_match

`ai_match` estimates the probability that a natural-language statement holds for
text, using the Jev backend's Noul mode. See the [AI Functions overview](./overview.md)
for experimental availability, configuration, NULL handling, and request limits.

## Signature

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

## Filter text

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

## Return and rank probabilities

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
