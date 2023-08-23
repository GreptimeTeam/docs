# Vector

[Vector](https://vector.dev/) is a high-performance observability data pipeline that puts organizations in control of their observability data.

## Integration

<!--@include: ../../db-cloud-shared/clients/vector-integration.md-->

GreptimeDB uses gRPC to communicate with Vector, so the default port for the vector sink is `4001`.
If you have changed the default gRPC port when starting GreptimeDB with [custom configurations](../operations/configuration.md#configuration-file), use your own port instead.

<!-- TODO ## Data Model -->
