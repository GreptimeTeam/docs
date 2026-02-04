---
name: greptimedb-pipeline
description: Guide for creating GreptimeDB Pipeline, by which user can add a process layer to GreptimeDB between ingestion and storage, to transform data.
---

# GreptimeDB Pipeline Guide

Create GreptimeDB pipeline definition to transform data into specific structured
table, including data extraction, processing, type parsing, datetime handling
and more.

## The workflow

To create greptimedb pipeline, we should follow these phases:

### Phase 1. Understanding GreptimeDB Pipeline

First, we should read greptimedb pipeline definitions and how it works from
GreptimeDB's documentation.

There are pages available, use WebFetch to load and understand them:

1. High level information of how to use custom pipeline
   https://docs.greptime.com/user-guide/logs/use-custom-pipelines/
2. Details about pipeline elements and docs for each processor, transform and
   dispatcher
   https://docs.greptime.com/reference/pipeline/pipeline-config/

We will always create version 2 pipeline.

### Phase 2. Create an initial pipeline that works

Ask user to provide a sample input data. It can be one of:

1. text data line
2. ndjson data line
3. an array of json data

And try to understand what type of information that user want to extract from
the sample data.

For text data line, we should try to split it by any potential field separator
like space or tab. Find out the datetime part and use `date` processor to parse
it. Try to name each field by its meaning. If it's impossible to understand the
text line, we try to use a field called `message` for all the line.

For ndjson and json, we will find out a datetime field as use `date` processor
on it to generate the time index. And we will use json key for all other fields.

Provide user a sample of how the initial pipeline definition will look like, as
well as how the parsed data to be like. We can use a markdown table to show each
field name, data type in greptimedb and values.

### Phase 3. Work on special requirements and verify

The user may have more requirements on particular field, use processor to
address them.

If we can the greptimedb MCP available, there is a `dryrun-pipeline` tool by
which we can provide pipeline definition and sample data to test against
greptimedb's implementation. The output is a table encoded as json.
