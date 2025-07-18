---
keywords: [关键日志, 错误日志, 运维日志, GreptimeDB 日志]
description: 通过关键日志了解 GreptimeDB 的运行情况，以及排查错误出现的原因。
---

# 运维关键日志

GreptimeDB 在运行过程中，会将一些关键的操作以及预期外的错误信息输出到日志中。
你可以通过这些日志了解 GreptimeDB 的运行情况，以及排查错误出现的原因。

## 日志位置

GreptimeDB 的组件默认都会输出 INFO 级别的日志到以下位置：

- 标准输出
- GreptimeDB 当前工作目录下的 `greptimedb_data/logs` 目录

日志文件的输出目录也可以通过配置文件的 `[logging]` 小节或者启动参数 `--log_dir` 修改：

```toml
[logging]
dir = "/path/to/logs"
```

日志文件格式为：
- `greptimedb.YYYY-MM-DD-HH` 包含 INFO 以上等级的日志
- `greptimedb-err.YYYY-MM-DD-HH` 包含错误日志

例如：

```bash
greptimedb.2025-04-11-06
greptimedb-err.2025-04-11-06
```

目前 GreptimeDB 的组件包括

- frontend
- datanode
- metasrv
- flownode

如果需要调整日志级别，如查看某组件 DEBUG 级别的日志，可以参考[这篇文档](https://github.com/GreptimeTeam/greptimedb/blob/main/docs/how-to/how-to-change-log-level-on-the-fly.md)在运行时进行修改。

## 重要日志

以下将列举建议关注的日志

### 错误日志

数据库在正常平稳运行时，不会输出错误日志。如果数据库的一些操作出现异常，或者出现了 panic，都会打印错误日志。建议用户检查所有组件的错误日志。

#### Panic

如果数据库出现了 panic ，则建议收集 panic 的日志反馈给官方。通常 panic 日志如下，关键字为 `panicked at`：

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

当 GreptimeDB 集群出现节点上线，节点下线，region 迁移，schema 变更等情况时， metasrv 都会记录相应的日志。因此，除了各个组件的错误日志外，也建议关注 metasrv 的以下日志关键字

#### Metasrv 切主/发起选举

```bash
// error 级别，标识当前 leader step down， 接下来会发生新的选举，注意 {:?} 这部分是 leader 标识
"Leader :{:?} step down"
```

#### Region 续租失败

```bash
// Warn 级别，表示一个 region 被拒绝续租，region 在某个 DN 上未被正常关闭/调度时，该 region 续租请求会被拒绝。
Denied to renew region lease for datanode: {datanode_id}, region_id: {region_id}
```

```bash
// Info 级别，DN 收到续租失败信息，并尝试关闭目标 region
Closing staled region:
```

#### Region Failover

```bash
// Warn 级别，发现部分 region 未通过 Phi 健康检测，需要执行 failover 操作，冒号后面好打印出相关的 region ids
Detects region failures:

// 某一个 region 迁移失败
Failed to wait region migration procedure

// Info 级别，当维护模式打开时，failover procedure 会被跳过。
Maintenance mode is enabled, skip failover
```

#### Region 迁移

```bash
// info 级别，表明某一个 region 开始迁移，日志后面会打印出 region 相关信息
Starting region migration procedure

// error 级别，某一个 region 迁移失败
Failed to wait region migration procedure
```

#### Procedure

Metasrv 内部通过一个叫做 procedure 的组件执行一些分布式操作。可以关注该组件的错误日志

```bash
Failed to execute procedure
```

#### Flow 创建失败

在创建 flow 失败时，通常在 procedure 的错误日志中可以看到失败的原因。日志可能包含以下关键字

```bash
Failed to execute procedure metasrv-procedure:: CreateFlow
```

#### License 过期
企业版的 license 过期时，metasrv 会打印如下 warning 日志。这时需要及时联系 Greptime 获取新的 license

```bash
License is expired at xxx, please coontact your GreptimeDB vendor to renew it
```

### Datanode

#### Compaction

在 compaction 开始和结束时，datanode 上会有如下日志：

```bash
2025-05-16T06:01:08.794415Z  INFO mito2::compaction::task: Compacted SST files, region_id: 4612794875904(1074, 0), input: [FileMeta { region_id: 4612794875904(1074, 0), file_id: FileId(a29500fb-cae0-4f3f-8376-cb3f14653378), time_range: (1686455010000000000::Nanosecond, 1686468410000000000::Nanosecond), level: 0, file_size: 45893329, available_indexes: [], index_file_size: 0, num_rows: 5364000, num_row_groups: 53, sequence: Some(114408000) }, FileMeta { region_id: 4612794875904(1074, 0), file_id: FileId(a31dcb1b-19ae-432f-8482-9e1b7db7b53b), time_range: (1686468420000000000::Nanosecond, 1686481820000000000::Nanosecond), level: 0, file_size: 45900506, available_indexes: [], index_file_size: 0, num_rows: 5364000, num_row_groups: 53, sequence: Some(119772000) }], output: [FileMeta { region_id: 4612794875904(1074, 0), file_id: FileId(5d105ca7-9e3c-4298-afb3-e85baae3b2e8), time_range: (1686455010000000000::Nanosecond, 1686481820000000000::Nanosecond), level: 1, file_size: 91549797, available_indexes: [], index_file_size: 0, num_rows: 10728000, num_row_groups: 105, sequence: Some(119772000) }], window: Some(86400), waiter_num: 0, merge_time: 3.034328293s
```

```bash
2025-05-16T06:01:08.805366Z  INFO mito2::request: Successfully compacted region: 4612794875904(1074, 0)
```
