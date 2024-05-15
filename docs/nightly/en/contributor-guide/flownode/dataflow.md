# Dataflow

dataflow(See `flow::compute` module) is the core computing module of `flow`, what it do is take a sql
and transform it into flow's internal execution plan, then render this execution plan to a actual dataflow, which is essentially a DAG of functions with input and output ports, and are triggered to run when needed.

For now this dataflow only support `map` and `reduce`, support for `join` will be added in the future.

Internally, dataflow handle data in row format, with a tuple like `(row, time, diff)`, where `row` is the actual data being passing and may contain multiple `Value`, `time` is the system time which track the dataflow's progress, and `diff` usually being `+1` or `-1` meaning the inserting or deleting or this row, so the tuple means the insert/delete of this `row` at given system `time`.