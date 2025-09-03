---
keywords: [ES, Elasticsearch, GreptimeDB, QueryDSL]
description: QueryDSL syntax supported by GreptimeDB Enterprise Edition
---

# Query

Since GreptimeDB and Elasticsearch are designed for different purposes, many features are not compatible. We have provided corresponding alternatives as much as possible. For each specific interface, we will explain GreptimeDB's implementation and the differences from Elasticsearch.

:::tip
All features related to boost scores are not supported.

The `_id` field is not automatically added or maintained. If you need to use it, please include this field in your original data.

Using @timestamp as a time field is not supported.

It is not allowed to include both query and aggregation in the same request.
:::

## Query Syntax

### match

In GreptimeDB, the `match` query is used to match one or more terms in a text field.

The following options are not supported: analyzer, auto_generate_synonyms_phrase_query, fuzziness, max_expansions, prefix_length, fuzzy_transpositions, fuzzy_rewrite, lenient, operator, minimum_should_match, zero_terms_query.

### match_phrase

In GreptimeDB, the `match_phrase` query is used to match a phrase in a text field. Different queries are generated based on the data type. If the data type is text, it is converted to a LIKE query. For other data types, it is converted to an equivalent value query.

The following options are not supported: analyzer, auto_generate_synonyms_phrase_query, fuzziness, max_expansions, prefix_length, fuzzy_transpositions, fuzzy_rewrite, lenient, operator, minimum_should_match, zero_terms_query.

### match_all

In GreptimeDB, the `match_all` query is used to match all documents.

### term

In GreptimeDB, the `term` query is used to match an exact value in a text field. The query is mainly converted to an equality query.

Currently, case_insensitive is not supported.

### prefix

In GreptimeDB, the `prefix` query is used to match a prefix in a text field. The query is mainly converted to a LIKE query.
For example, if you query for text starting with `yi`, it will be converted to `LIKE 'yi%'`.

The following options are not supported: rewrite, case_insensitive.

### range

In GreptimeDB, the `range` query is used to match a range in a text field. The query is mainly converted to greater than or equal to and less than or equal to conditions.

Currently, format, relation, time_zone, and boost are not supported.

### exists

In GreptimeDB, the `exists` query is used to match values that exist in a text field. The query is mainly converted to an existence condition.

### bool

In GreptimeDB, the `bool` query is used to match multiple query conditions. The query is mainly converted to a combination of AND and OR conditions.