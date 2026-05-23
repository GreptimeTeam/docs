# Self-Monitoring Export References

GreptimeDB source:

- https://github.com/GreptimeTeam/greptimedb

For source lookup, do not assume the user has a local GreptimeDB repository and do not search the user's current workspace unless explicitly instructed. Prefer to clone <https://github.com/GreptimeTeam/greptimedb> into a temporary source checkout, search that checkout, and clean it up after use. Match the checkout to the investigated GreptimeDB version whenever possible; if the version, tag, or commit cannot be determined or checked out, use the main branch. Use public HTTPS only; do not require or store credentials. If cloning is unavailable, search the remote GreptimeDB repository instead. Use source lookup before generic `ERROR` / `WARN` aggregation when the user's description does not directly map to known log keywords.

Suggested source lookup flow:

1. Create a temporary directory under `${TMPDIR:-/tmp}`.
2. Determine the investigated GreptimeDB version from self-monitoring data when available, such as `greptime_app_version`.
3. Clone `https://github.com/GreptimeTeam/greptimedb` into that directory. Prefer a shallow clone when possible.
4. Check out the matching release tag or commit when it can be identified. If no matching version can be identified or checked out, use the main branch.
5. Search only inside that temporary source checkout.
6. Remove the temporary source checkout after the lookup.

Do not confuse this temporary source checkout with server-side `/tmp/...` paths used by `COPY TO` export examples.

GreptimeDB documentation:

- https://docs.greptime.com

GreptimeDB documentation repository:

- https://github.com/GreptimeTeam/docs

Self-monitoring GreptimeDB clusters:

- https://docs.greptime.com/user-guide/deployments-administration/monitoring/cluster-monitoring-deployment/

SQL `COPY`:

- https://docs.greptime.com/reference/sql/copy/

SQL functions / date_bin:

- https://docs.greptime.com/reference/sql/functions/df-functions/

SQL range query:

- https://docs.greptime.com/reference/sql/range/

HTTP API:

- https://docs.greptime.com/user-guide/protocols/http/

HTTP endpoints:

- https://docs.greptime.com/reference/http-endpoints/

CLI data export:

- https://docs.greptime.com/reference/command-lines/utilities/data/

Timezone:

- https://docs.greptime.com/user-guide/timezone/

Troubleshooting:

- https://docs.greptime.com/user-guide/deployments-administration/troubleshooting/
