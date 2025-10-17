---
keywords: [query logs, pattern matching, matches_term, query statements, log analysis]
description: Provides a guide on using GreptimeDB's query language for effective searching and analysis of log data, including pattern matching and query statements.
---

# Fulltext Search

This document provides a guide on how to use GreptimeDB's query language for effective searching and analysis of log data.

GreptimeDB allows for flexible querying of data using SQL statements. This section introduces specific search functions and query statements designed to enhance your log querying capabilities.

## Pattern Matching Using the `matches_term` Function

In SQL statements, you can use the `matches_term` function to perform exact term/phrase matching, which is especially useful for log analysis. The `matches_term` function supports pattern matching on `String` type columns. You can also use the `@@` operator as a shorthand for `matches_term`. Here's an example of how it can be used:

```sql
-- Using matches_term function
SELECT * FROM logs WHERE matches_term(message, 'error') OR matches_term(message, 'fail');

-- Using @@ operator (shorthand for matches_term)
SELECT * FROM logs WHERE message @@ 'error' OR message @@ 'fail';
```

The `matches_term` function is designed for exact term/phrase matching and uses the following syntax:

- `text`: The text column to search, which should contain textual data of type `String`.
- `term`: The search term or phrase to match exactly, following these rules:
  - Case-sensitive matching
  - Matches must have non-alphanumeric boundaries (start/end of text or any non-alphanumeric character)
  - Supports whole-word matching and phrase matching

## Query Statements

### Simple Term Matching

The `matches_term` function performs exact word matching, which means it will only match complete words that are properly bounded by non-alphanumeric characters or the start/end of the text. This is particularly useful for finding specific error messages, status codes, version numbers, or paths in logs.

Error messages:
```sql
-- Using matches_term function
SELECT * FROM logs WHERE matches_term(message, 'error');

-- Using @@ operator
SELECT * FROM logs WHERE message @@ 'error';
```

Examples of matches and non-matches:
- ✅ "An error occurred!" - matches because "error" is a complete word
- ✅ "Critical error: system failure" - matches because "error" is bounded by space and colon
- ✅ "error-prone" - matches because "error" is bounded by hyphen
- ❌ "errors" - no match because "error" is part of a larger word
- ❌ "error123" - no match because "error" is followed by numbers
- ❌ "errorLogs" - no match because "error" is part of a camelCase word

File paths and commands:
```sql
-- Find specific command with path
SELECT * FROM logs WHERE matches_term(message, '/start');
```

Examples of matches and non-matches for '/start':
- ✅ "GET /app/start" - matches because "/start" is a complete term
- ✅ "Command: /start-process" - matches because "/start" is bounded by hyphen
- ✅ "Command: /start" - matches because "/start" is at the end of the message
- ❌ "start" - no match because it's missing the leading slash
- ❌ "start/stop" - no match because "/start" is not a complete term

### Multiple Term Searches

You can combine multiple `matches_term` conditions using the `OR` operator to search for logs containing any of several terms. This is useful when you want to find logs that might contain different variations of an error or different types of issues.

```sql
-- Using matches_term function
SELECT * FROM logs WHERE matches_term(message, 'critical') OR matches_term(message, 'error');

-- Using @@ operator
SELECT * FROM logs WHERE message @@ 'critical' OR message @@ 'error';
```

This query will find logs containing either "critical" or "error" as complete words. Each term is matched independently, and the results include logs that match either condition.

Examples of matches and non-matches:
- ✅ "critical error: system failure" - matches both terms
- ✅ "An error occurred!" - matches "error"
- ✅ "critical failure detected" - matches "critical"
- ❌ "errors" - no match because "error" is part of a larger word
- ❌ "critical_errors" - no match because terms are part of larger words

### Exclusion Searches

You can use the `NOT` operator with `matches_term` to exclude certain terms from your search results. This is useful when you want to find logs containing one term but not another.

```sql
-- Using matches_term function
SELECT * FROM logs WHERE matches_term(message, 'error') AND NOT matches_term(message, 'critical');

-- Using @@ operator
SELECT * FROM logs WHERE message @@ 'error' AND NOT message @@ 'critical';
```

This query will find logs containing the word "error" but not containing the word "critical". This is particularly useful for filtering out certain types of errors or focusing on specific error categories.

Examples of matches and non-matches:
- ✅ "An error occurred!" - matches because it contains "error" but not "critical"
- ❌ "critical error: system failure" - no match because it contains both terms
- ❌ "critical failure detected" - no match because it contains "critical"

### Required Term Searches

You can use the `AND` operator to require that multiple terms be present in the log message. This is useful for finding logs that contain specific combinations of terms.

```sql
-- Using matches_term function
SELECT * FROM logs WHERE matches_term(message, 'critical') AND matches_term(message, 'error');

-- Using @@ operator
SELECT * FROM logs WHERE message @@ 'critical' AND message @@ 'error';
```

This query will find logs containing both "critical" and "error" as complete words. Both conditions must be satisfied for a log to be included in the results.

Examples of matches and non-matches:
- ✅ "critical error: system failure" - matches because it contains both terms
- ❌ "An error occurred!" - no match because it only contains "error"
- ❌ "critical failure detected" - no match because it only contains "critical"

### Phrase Matching

The `matches_term` function can also match exact phrases, including those with spaces. This is useful for finding specific error messages or status updates that contain multiple words.

```sql
-- Using matches_term function
SELECT * FROM logs WHERE matches_term(message, 'system failure');

-- Using @@ operator
SELECT * FROM logs WHERE message @@ 'system failure';
```

This query will find logs containing the exact phrase "system failure" with proper boundaries. The entire phrase must match exactly, including the space between words.

Examples of matches and non-matches:
- ✅ "Alert: system failure detected" - matches because the phrase is properly bounded
- ✅ "system failure!" - matches because the phrase is properly bounded
- ❌ "system-failure" - no match because the words are separated by a hyphen instead of a space
- ❌ "system failure2023" - no match because the phrase is followed by numbers

### Case-Insensitive Matching

While `matches_term` is case-sensitive by default, you can achieve case-insensitive matching by converting the text to lowercase before matching.

```sql
-- Using matches_term function
SELECT * FROM logs WHERE matches_term(lower(message), 'warning');

-- Using @@ operator
SELECT * FROM logs WHERE lower(message) @@ 'warning';
```

This query will find logs containing the word "warning" regardless of its case. The `lower()` function converts the entire message to lowercase before matching.

Examples of matches and non-matches:
- ✅ "Warning: high temperature" - matches after case conversion
- ✅ "WARNING: system overload" - matches after case conversion
- ❌ "warned" - no match because it's a different word
- ❌ "warnings" - no match because it's a different word
