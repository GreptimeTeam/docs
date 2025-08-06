---
keywords: [key logs, error logs, operational logs, GreptimeDB logs]
description: Understand GreptimeDB's operational status and troubleshoot errors through key logs.
---

# Key Logs

During operation, GreptimeDB outputs key operations and unexpected error information to logs.
You can use these logs to understand GreptimeDB's operational status and troubleshoot errors.

## Log Location

GreptimeDB components default to outputting INFO level logs to the following locations:

- Standard output
- `greptimedb_data/logs` directory under GreptimeDB's current working directory

The log output directory can also be modified through the `[logging]` section in the configuration file or the `--log_dir` startup parameter:

```toml
[logging]
dir = "/path/to/logs"
```

Log file formats are:
- `greptimedb.YYYY-MM-DD-HH` contains logs of INFO level and above
- `greptimedb-err.YYYY-MM-DD-HH` contains error logs

For example:

```bash
greptimedb.2025-04-11-06
greptimedb-err.2025-04-11-06
```

Currently, GreptimeDB components include:

- frontend
- datanode
- metasrv
- flownode

If you need to adjust log levels, such as viewing DEBUG level logs for a component, you can refer to [this document](https://github.com/GreptimeTeam/greptimedb/blob/main/docs/how-to/how-to-change-log-level-on-the-fly.md) to modify them at runtime.

## Important Logs

The following lists recommended logs to monitor:

### Error Logs

When the database is running normally and stably, it will not output error logs. If database operations encounter exceptions or panics occur, error logs will be printed. It is recommended that users check error logs from all components.

#### Panic

If the database encounters a panic, it is recommended to collect the panic logs and report them to the official team. Typical panic logs look like this, with the keyword `panicked at`:

```bash
2025-04-02T14:44:24.485935Z ERROR common_telemetry::panic_hook: panicked at /greptime/.cargo/git/checkouts/datafusion-11a8b534adb6bd68-shallow/2464703/datafusion/expr/src/logical_plan/plan.rs:1035:25:
with_new_exprs for Distinct does not support sort expressions backtrace=   0: backtrace::backtrace::libunwind::trace
             at /greptime/.cargo/registry/src/index.crates.io-1949cf8c6b5b557f/backtrace-0.3.74/src/backtrace/libunwind.rs:116:5
      backtrace::backtrace::trace_unsynchronized
             at /greptime/.cargo/registry/src/index.crates.io-1949cf8c6b5b557f/backtrace-0.3.74/src/backtrace/mod.rs:66:5
   1: backtrace::backtrace::trace
             at /greptime/.cargo/registry/src/index.crates.io-1949cf8c6b5b557f/backtrace-0.3.74/src/backtrace/mod.rs:53:14
   2: backtrace::capture::Backtrace::create
             at /greptime/.cargo/registry/src/index.crates.io-1949cf8c6b5b557f/backtrace-0.3.74/src/capture.rs:292:9
   3: backtrace::capture::Backtrace::new
             at /greptime/.cargo/registry/src/index.crates.io-1949cf8c6b5b557f/backtrace-0.3.74/src/capture.rs:257:22
   4: common_telemetry::panic_hook::set_panic_hook::{{closure}}
             at /greptime/codes/greptime/procedure-traits/src/common/telemetry/src/panic_hook.rs:37:25
   5: <alloc::boxed::Box<F,A> as core::ops::function::Fn<Args>>::call
             at /rustc/409998c4e8cae45344fd434b358b697cc93870d0/library/alloc/src/boxed.rs:1984:9
      std::panicking::rust_panic_with_hook
             at /rustc/409998c4e8cae45344fd434b358b697cc93870d0/library/std/src/panicking.rs:820:13
   6: std::panicking::begin_panic_handler::{{closure}}
             at /rustc/409998c4e8cae45344fd434b358b697cc93870d0/library/std/src/panicking.rs:678:13
   7: std::sys::backtrace::__rust_end_short_backtrace
             at /rustc/409998c4e8cae45344fd434b358b697cc93870d0/library/std/src/sys/backtrace.rs:168:18
   8: rust_begin_unwind
             at /rustc/409998c4e8cae45344fd434b358b697cc93870d0/library/std/src/panicking.rs:676:5
   9: core::panicking::panic_fmt
             at /rustc/409998c4e8cae45344fd434b358b697cc93870d0/library/core/src/panicking.rs:75:14
  10: datafusion_expr::logical_plan::plan::LogicalPlan::with_new_exprs
             at /greptime/.cargo/git/checkouts/datafusion-11a8b534adb6bd68-shallow/2464703/datafusion/expr/src/logical_plan/plan.rs:1035:25
  11: <query::optimizer::type_conversion::TypeConversionRule as query::optimizer::ExtensionAnalyzerRule>::analyze::{{closure}}
             at /greptime/codes/greptime/procedure-traits/src/query/src/optimizer/type_conversion.rs:105:17
  12: core::ops::function::impls::<impl core::ops::function::FnMut<A> for &F>::call_mut
             at /greptime/.rustup/toolchains/nightly-2024-12-25-aarch64-apple-darwin/lib/rustlib/src/rust/library/core/src/ops/function.rs:272:13
  13: core::ops::function::impls::<impl core::ops::function::FnOnce<A> for &mut F>::call_once
             at /greptime/.rustup/toolchains/nightly-2024-12-25-aarch64-apple-darwin/lib/rustlib/src/rust/library/core/src/ops/function.rs:305:13
  14: datafusion_common::tree_node::Transformed<T>::transform_parent
             at /greptime/.cargo/git/checkouts/datafusion-11a8b534adb6bd68-shallow/2464703/datafusion/common/src/tree_node.rs:764:44
  15: datafusion_common::tree_node::TreeNode::transform_up::transform_up_impl::{{closure}}
             at /greptime/.cargo/git/checkouts/datafusion-11a8b534adb6bd68-shallow/2464703/datafusion/common/src/tree_node.rs:265:13
  16: stacker::maybe_grow
             at /greptime/.cargo/registry/src/index.crates.io-1949cf8c6b5b557f/stacker-0.1.17/src/lib.rs:55:9
      datafusion_common::tree_node::TreeNode::transform_up::transform_up_impl
             at /greptime/.cargo/git/checkouts/datafusion-11a8b534adb6bd68-shallow/2464703/datafusion/common/src/tree_node.rs:260:9
  17: datafusion_common::tree_node::TreeNode::transform_up
             at /greptime/.cargo/git/checkouts/datafusion-11a8b534adb6bd68-shallow/2464703/datafusion/common/src/tree_node.rs:269:9
  18: datafusion_common::tree_node::TreeNode::transform
             at /greptime/.cargo/git/checkouts/datafusion-11a8b534adb6bd68-shallow/2464703/datafusion/common/src/tree_node.rs:220:9
  19: <query::optimizer::type_conversion::TypeConversionRule as query::optimizer::ExtensionAnalyzerRule>::analyze
             at /greptime/codes/greptime/procedure-traits/src/query/src/optimizer/type_conversion.rs:46:9
  20: query::query_engine::state::QueryEngineState::optimize_by_extension_rules::{{closure}}
             at /greptime/codes/greptime/procedure-traits/src/query/src/query_engine/state.rs:195:17
  21: core::iter::traits::iterator::Iterator::try_fold
             at /greptime/.rustup/toolchains/nightly-2024-12-25-aarch64-apple-darwin/lib/rustlib/src/rust/library/core/src/iter/traits/iterator.rs:2370:21
  22: query::query_engine::state::QueryEngineState::optimize_by_extension_rules
             at /greptime/codes/greptime/procedure-traits/src/query/src/query_engine/state.rs:192:9
  23: query::planner::DfLogicalPlanner::plan_sql::{{closure}}::{{closure}}
             at /greptime/codes/greptime/procedure-traits/src/query/src/planner.rs:119:20
  24: <tracing::instrument::Instrumented<T> as core::future::future::Future>::poll
             at /greptime/.cargo/registry/src/index.crates.io-1949cf8c6b5b557f/tracing-0.1.40/src/instrument.rs:321:9
  25: query::planner::DfLogicalPlanner::plan_sql::{{closure}}
             at /greptime/codes/greptime/procedure-traits/src/query/src/planner.rs:71:5
  26: <query::planner::DfLogicalPlanner as query::planner::LogicalPlanner>::plan::{{closure}}::{{closure}}
             at /greptime/codes/greptime/procedure-traits/src/query/src/planner.rs:198:73
  27: <tracing::instrument::Instrumented<T> as core::future::future::Future>::poll
             at /greptime/.cargo/registry/src/index.crates.io-1949cf8c6b5b557f/tracing-0.1.40/src/instrument.rs:321:9
  28: <query::planner::DfLogicalPlanner as query::planner::LogicalPlanner>::plan::{{closure}}
             at /greptime/codes/greptime/procedure-traits/src/query/src/planner.rs:195:5
...
```

### Metasrv

When the GreptimeDB cluster experiences node online/offline events,
region migration, schema changes, etc.,
metasrv will record corresponding logs.
Therefore, in addition to error logs from each component,
it is also recommended to monitor the following metasrv log keywords:

#### Metasrv Leader Step Down/Election

```bash
// Error level, indicates current leader stepped down, new election will follow. Note the {:?} part is the leader identifier
"Leader :{:?} step down"
```

#### Region Lease Renewal Failure

```bash
// Warning level, indicates a region lease renewal was denied. Region lease requests will be rejected when the region is not properly closed/scheduled on a datanode.
Denied to renew region lease for datanode: {datanode_id}, region_id: {region_id}
```

```bash
// Info level, datanode receives lease renewal failure and attempts to close target region
Closing staled region:
```

#### Region Failover

```bash
// Warning level, detects some regions failed Phi health check, need to execute failover operation. Region IDs will be printed after the colon
Detects region failures:

// A region migration failed
Failed to wait region migration procedure

// Info level, when maintenance mode is enabled, failover procedure will be skipped
Maintenance mode is enabled, skip failover
```

#### Region Migration

```bash
// Info level, indicates a region starts migration. Region information will be printed after the log
Starting region migration procedure

// Error level, a region migration failed
Failed to wait region migration procedure
```

#### Procedure

Metasrv internally uses a component called "procedure" to execute distributed operations. You can monitor error logs from this component:

```bash
Failed to execute procedure
```

#### Flow Creation Failure

When flow creation fails, the failure reason can usually be seen in procedure error logs. Logs may contain the following keywords:

```bash
Failed to execute procedure metasrv-procedure:: CreateFlow
```

#### License Expiration
When the enterprise edition license expires, metasrv will print the following warning log. You need to contact Greptime promptly to obtain a new license:

```bash
License is expired at xxx, please contact your GreptimeDB vendor to renew it
```

### Datanode

#### Compaction

When compaction starts and ends, datanode will log the following information:

```bash
2025-05-16T06:01:08.794415Z  INFO mito2::compaction::task: Compacted SST files, region_id: 4612794875904(1074, 0), input: [FileMeta { region_id: 4612794875904(1074, 0), file_id: FileId(a29500fb-cae0-4f3f-8376-cb3f14653378), time_range: (1686455010000000000::Nanosecond, 1686468410000000000::Nanosecond), level: 0, file_size: 45893329, available_indexes: [], index_file_size: 0, num_rows: 5364000, num_row_groups: 53, sequence: Some(114408000) }, FileMeta { region_id: 4612794875904(1074, 0), file_id: FileId(a31dcb1b-19ae-432f-8482-9e1b7db7b53b), time_range: (1686468420000000000::Nanosecond, 1686481820000000000::Nanosecond), level: 0, file_size: 45900506, available_indexes: [], index_file_size: 0, num_rows: 5364000, num_row_groups: 53, sequence: Some(119772000) }], output: [FileMeta { region_id: 4612794875904(1074, 0), file_id: FileId(5d105ca7-9e3c-4298-afb3-e85baae3b2e8), time_range: (1686455010000000000::Nanosecond, 1686481820000000000::Nanosecond), level: 1, file_size: 91549797, available_indexes: [], index_file_size: 0, num_rows: 10728000, num_row_groups: 105, sequence: Some(119772000) }], window: Some(86400), waiter_num: 0, merge_time: 3.034328293s
```

```bash
2025-05-16T06:01:08.805366Z  INFO mito2::request: Successfully compacted region: 4612794875904(1074, 0)
```

