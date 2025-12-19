---
keywords: [release notes, elasticsearch, read replicas, triggers]
description: Release notes for GreptimeDB Enterprise version 25.05, highlighting new features like elasticsearch compatibility, read replicas and triggers.
---

# GreptimeDB Enterprise 25.11

We are pleased to introduce the 25.11 release of GreptimeDB Enterprise.

## Enterprise Features

### Initial release of bulk ingestion

Bulk ingestion is an alternative ingestion approach introduced to overcome some
limitation of our normal integration path in OSS. It's designed for high volume
ingestion scenario. According to our test, an acceleration up to 5x can be
achieved by bulk ingestion.

In this release, we made bulk ingestion available for Prometheus remote write
API. The support for other APIs are coming in our future dot releases of 25.11.

There is no client API change required for adopting bulk ingestion.

### Feature completion of Triggers

Trigger has seen massive improves for its feature set. Adding support for
Prometheus equivalent for `for` and `keep_firing_for`, to bring in state
management of trigger events.

[Read more from trigger documentation](../trigger.md).

## Features From GreptimeDB OSS

This release is based on GreptimeDB OSS v1.0.0-beta.2.
