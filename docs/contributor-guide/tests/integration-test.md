---
keywords: [integration tests, Rust test harness, storage backend, Kafka, protocols]
description: Run multi-component and external-service tests from tests-integration.
---

# Integration Test

## Introduction

The `tests-integration/` crate contains Rust test-harness cases that need several GreptimeDB components or an external service. Typical cases exercise HTTP or gRPC behavior, object-storage backends, Kafka WAL, and TLS-enabled dependencies.

Use an integration test when the behavior cannot be established through a crate-local unit test or a sqlness query case. Keep protocol assertions at the public boundary and use the fixtures under `tests-integration/fixtures/` rather than introducing a second environment setup.

The authoritative setup and command list is in [`tests-integration/README.md`](https://github.com/GreptimeTeam/greptimedb/blob/main/tests-integration/README.md). Tests that require credentials or endpoints read them from a repository-root `.env` file created from `.env.example`; do not commit credentials.

Run the general integration group from the repository root:

```shell
cargo test integration
```

Backend-specific groups use their own filters, for example:

```shell
cargo test s3
cargo test oss
cargo test azblob
```

Kafka and TLS cases require the Docker Compose services documented in the integration README. Start only the dependencies required by the selected test, and clean up those services after the run.
