---
keywords: [enterprise, metasrv, datanode, region placement, env affinity selector, availability zone]
description: Configure the Enterprise env affinity selector to place newly created table regions on datanodes in the same environment as the frontend that receives the DDL request.
---

# Configure Env Affinity Region Placement

The env affinity selector is an Enterprise-only Metasrv plugin that places newly created table regions on datanodes in the same environment as the frontend that receives the DDL request. Its main purpose is to prevent unexpected cross-AZ or cross-region traffic, which can introduce extra latency and unexpected network transfer costs. It is useful when frontends and datanodes are deployed across availability zones, regions, or other failure domains, and you want table creation to keep region placement close to the request origin.

:::tip NOTE
This feature is for the Enterprise Edition only. Please do not use the open-source image to enable this feature. Please [contact us](https://greptime.com/contactus) if you want to use it.
:::

## How it works

When `env_affinity_selector` is enabled, Metasrv wraps the configured datanode selector:

1. Metasrv reads the origin frontend from the DDL request selector context.
2. Metasrv reads the configured affinity environment variables from that frontend's heartbeat information.
3. Metasrv filters candidate datanodes to those with matching environment variable values.
4. Metasrv delegates the final selection among the matching datanodes to the base selector configured by the top-level `selector` option.

For example, if a `CREATE TABLE` request reaches a frontend whose heartbeat reports `REGION=us-east` and `AZ=az-a`, Metasrv first filters candidate datanodes to those reporting the same `REGION` and `AZ`, then applies the configured base selector, such as `load_based`, to choose the final datanodes.

Requests that do not carry the origin frontend selector context bypass the env affinity selector and use the base selector directly. This keeps non-DDL selector paths unchanged.

## Configure heartbeat environment variables

The frontend and datanode processes must report the same affinity keys in their heartbeat information. Configure `heartbeat_env_vars` as a top-level option for both frontends and datanodes:

```toml
heartbeat_env_vars = ["REGION", "AZ"]
```

Each process must also have the corresponding environment variables set at startup:

```shell
REGION=us-east
AZ=az-a
```

:::warning
Do not include sensitive variables in `heartbeat_env_vars`. The selected values are sent to Metasrv through heartbeat messages and stored in Metasrv node information.
:::

For general heartbeat configuration, see [Heartbeat configuration](/user-guide/deployments-administration/configuration.md#heartbeat-configuration).

## Configure Metasrv

Enable `env_affinity_selector` in the Enterprise plugin configuration for Metasrv:

```toml
# The base datanode selector. Env affinity filters candidates first, then uses
# this selector to choose from the matching datanodes.
selector = "load_based"

[[plugins]]
[plugins.env_affinity_selector]
enable = true

# Environment variable names that must match between the origin frontend and
# candidate datanodes. The default value is ["AZ"].
affinity_keys = ["REGION", "AZ"]

# Optional. The default value is "origin_frontend_addr" and usually does not
# need to be changed.
# origin_frontend_addr_extension_key = "origin_frontend_addr"

# Controls behavior when env affinity cannot be applied or when there are not
# enough same-env datanode candidates. Valid values are "error" and
# "base_selector". The default value is "error".
fallback_selector = "base_selector"
```

The top-level `selector` option still selects the base datanode selector. Supported base selectors include `round_robin`, `lease_based`, and `load_based`. Env affinity does not replace the base selector; it constrains the candidate datanodes before the base selector makes the final choice.

## Fallback behavior

Use `fallback_selector` to control what Metasrv does when env affinity cannot be applied.

| Value | Behavior |
| --- | --- |
| `error` | Return an error when the affinity context is invalid or there are not enough same-env datanode candidates. This is the default and prevents placement outside the matching environment. |
| `base_selector` | Log a warning and fall back to the base selector configured by the top-level `selector` option. The fallback can select any datanode accepted by the base selector. |

Invalid affinity context includes:

- The origin frontend is not active.
- The frontend heartbeat is missing one or more configured `affinity_keys`.
- `affinity_keys` is empty.

Insufficient same-env candidates includes:

- No datanode matches the origin frontend environment.
- The selector requires multiple datanodes, duplicate selection is not allowed, and the number of matching datanodes is smaller than the required number.

The legacy `strict` option is not supported. Configurations that still specify `strict` are rejected.

## Kubernetes example

The following Helm values show a cluster deployed across two availability zones. Frontends and datanodes report `REGION` and `AZ` through heartbeat extensions, and Metasrv enables env affinity placement.

```yaml
frontend:
  replicas: 2
  configData: |
    heartbeat_env_vars = ["REGION", "AZ"]
  podTemplate:
    main:
      env:
        - name: REGION
          value: us-east
        - name: AZ
          valueFrom:
            fieldRef:
              fieldPath: metadata.labels['topology.kubernetes.io/zone']

datanodeGroups:
  - name: az-a
    replicas: 3
    config: |
      heartbeat_env_vars = ["REGION", "AZ"]
    template:
      main:
        env:
          - name: REGION
            value: us-east
          - name: AZ
            value: az-a
  - name: az-b
    replicas: 3
    config: |
      heartbeat_env_vars = ["REGION", "AZ"]
    template:
      main:
        env:
          - name: REGION
            value: us-east
          - name: AZ
            value: az-b

meta:
  configData: |
    selector = "load_based"

    [[plugins]]
    [plugins.env_affinity_selector]
    enable = true
    affinity_keys = ["REGION", "AZ"]
    fallback_selector = "error"
```

After applying the configuration, create a table through a frontend in each environment and use `SHOW REGION` to verify where the new regions are placed. For more information, see [SHOW statement extensions](/reference/sql/show.md#extensions-to-show-statements).

## Best practices

- Use stable, low-cardinality keys such as `REGION`, `AZ`, or `ZONE`.
- Configure the same `heartbeat_env_vars` on every frontend and datanode that participates in DDL placement.
- Start with `fallback_selector = "error"` when strict placement is required.
- Use `fallback_selector = "base_selector"` only when availability is more important than staying within the matching environment.
- Use `load_based` as the base selector when you want env-affinity placement and load-aware distribution within the matching environment.
