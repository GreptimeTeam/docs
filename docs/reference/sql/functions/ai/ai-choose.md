---
keywords: [ai_choose, AI functions, classification, criteria, natural language]
description: Use ai_choose to classify text into a named option from JSON criteria.
---

# ai_choose

`ai_choose` classifies text into one of the supplied options, using the Jev
backend's Choice mode. See the [AI Functions overview](./overview.md) for
experimental availability, configuration, NULL handling, and request limits.

## Signature

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

## Criteria

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

## Example

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
