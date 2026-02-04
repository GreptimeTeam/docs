---
name: greptimedb-flow
description: Guide for creating GreptimeDB flow tasks, which generating materialized view for continuous aggregation.
---

# GreptimeDB Flow Guide

Create GreptimeDB flow definition to do time window based aggregation on the fly
while data ingested into GreptimeDB. This is how GreptimeDB's light-weighted
streaming engine works.

Flow is also known as:

1. Stream computing
2. Materialized View
3. Continuous aggregation

## The workflow

To create GreptimeDB flow task, we should follow these phases:

### Phase 1. Learn and understand Greptime Flow

First, we read GreptimeDB flow definitions and how it works from the
documentation.

There are doc pages available, use WebFetch to load and understand them:

1. Overview and quick example:
   https://docs.greptime.com/user-guide/flow-computation/overview/
2. Examples for continuous aggregation:
   https://docs.greptime.com/user-guide/flow-computation/continuous-aggregation/
3. SQL DDL for flow, sink table and related concepts:
   https://docs.greptime.com/user-guide/flow-computation/manage-flow/

### Phase 2. Create flow tasks

We should try to understand:

1. time window user want to use
2. aggregation fields and rules

Create the flow and sink table DDL. Note that we will always provide `CREATE
TABLE` statement for sink table, together with the `CREATE FLOW` statement
because it's required.

### Phase 3. Verify the tasks

If greptimedb-mcp-server is available, we can use its sql tools to execute the
DDL. Try to generate some sample data and verify the sink table via SQL
select. We can use MySQL style SELECT statements on GreptimeDB for most cases.

## Reference

1. Aggregation functions of Flow:
   https://docs.greptime.com/user-guide/flow-computation/expressions/
2. A full list of aggregation functions
   https://docs.greptime.com/reference/sql/functions/df-functions/#aggregate-functions
