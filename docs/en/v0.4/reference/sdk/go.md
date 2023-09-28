# Go SDK

A Go Client for GreptimeDB, which is compatible with GreptimeDB protocol and lightweight.

## Features

- Concurrent safe
- Non-blocking
- Easy to use with Metric and Series struct
- Support Sql and PromQL in querying

## How to use

Please refer to User Guide chapter to learn [how to insall SDK](/en/v0.4/user-guide/clients/sdk-libraries/go.md),
[write data](/en/v0.4/user-guide/write-data/sdk-libraries/go.md) and [query data](/en/v0.4/user-guide/query-data/sdk-libraries/go.md).

## Configuration

| Name     | Description                                                           |
| :------- | :-------------------------------------------------------------------- |
| Host     | GreptimeDB server host                                                |
| Port     | Default is 4001                                                       |
| Username | Leave the field empty if connecting a database without authentication |
| Password | Leave the field empty if connecting a database without authentication |
| Database | Default database to operate on                                        |

## Usage Examples

For fully runnable code snippets and explanations for common methods, see the [Examples][example].

<!-- link -->

[example]: https://pkg.go.dev/github.com/GreptimeTeam/greptimedb-client-go#example-package

## API

Please refer to [API Document](https://pkg.go.dev/github.com/GreptimeTeam/greptimedb-client-go).
