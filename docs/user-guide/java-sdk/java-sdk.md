# Java SDK

## Introduction

A Java Client for GreptimeDB, which is compatible with GreptimeDB protocol and lightweight.

## Features

- SPI-based extensible network transport layer; provides the default implementation by using the
gRPC framework
- Non-blocking, purely asynchronous API, easy to use
- Automatically collects various performance metrics by default. Users can then configure them and
write to local files
- Users can take in-memory snapshots of critical objects, configure them, and write to local files.
This is helpful when troubleshooting complex issues

## Quick Start
Learn how to establish a connection to GreptimeDB and begin working with data [Quick Start](quick-start.md) section.

## Quick Reference
See the [Quick Reference](quick-reference.md) section for the API in the Java SDK.

## Usage Examples
For fully runnable code snippets and explanations for common methods, see the [Usage Examples](https://github.com/GreptimeTeam/greptimedb-client-java/tree/main/greptimedb-example/src/main/java/io/greptime/example).
