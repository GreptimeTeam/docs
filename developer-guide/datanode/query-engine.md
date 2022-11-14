# Query Engine

## Introduction

GreptimeDB's query engine is heavily dependent on [Apache DataFusion][1] (subproject under [Apache
Arrow][2]), a brilliant query engine in Rust. It provides a set of well functional components from
logical plan, physical plan and the execution runtime. Our query engine is generally built on top
of it. Here is how each component is orchestrated and their positions during an execution procedure.

![Execution Procedure](../../public/execution-procedure.png)

The entry point is logical plan, which is used as the general intermediate representation of a
query or execution logic etc. Two noticeable sources of logical plan are from the user query, like
SQL through SQL parser and planner. Or from the Frontend's distributed query, this part will be
detailed in the following section.

Next is physical plan, or in some code called execution plan. Unlike logical plan which is a big
enumeration containing all the logical plan variants (except the special extension plan node),
physical plan is in fact a trait that defines a group of methods that will be invoked during
execution. All the data processing logic is encapsulated in corresponding structures that
implemented the trait. They are the actual operations that will be performed on the data, like
aggregator MIN or AVG, and table scan SELECT ... FROM.

Optimization phase, which transforms both logical and physical plans to achieve a better execution
performance, is now all based on rules, or in other words "Rule Based Optimization". Some of the
rules are DataFusion native and others are for our scenarios. In the future, we plan to add more
rules and leverage the data statistics to perform cost based optimization or CBO.

The last phase "execute" is a verb, stands for the procedure that reads data from storage, performs
calculations and generates the expected result. It's more abstract than previous concepts, but just
simply image it as executing a rust async function. And it's indeed a future (stream).

To see how your SQL will be represented in logical or physical plan, EXPLAIN [VERBOSE] \<SQL\> is
very useful.

## Data Representation

GreptimeDB uses [Apache Arrow][2] as the in-memory data representation. It's column-oriented and
cross-planform format, and also contains lots of high-performance data operators. These features
make it convenient to share data in many different environments, and implement calculation logic
easily.

## Indexing

In time series data, there are two important dimensions timestamp column and tag columns (or like
primary key in a general relational database). GreptimeDB groups data in time buckets, so it's easy
to locate and extract data within the expected time range at a very low cost. And from the other
data columns, the mainly used persist file format [Apache Parquet][3] in GreptimeDB helps a lot. It
provides multi- level indices and filters that make it easy to prune data during querying. And we
plan to utilize this feature more in depth, as well as develop our separated index to handle the
more complex use cases in the future.

## Statistics[WIP]

## Extensibility

Extending operations in GreptimeDB is extremely simple. It now supports two ways to do this. One
marvellous way is via the [Python Coprocessor][4] interface, or you can implement your operator like
[this][5].

## Distributed Execution

Covered in Clustering & Sharding, #Distributed Querying.

[1]: <https://github.com/apache/arrow-datafusion>
[2]: <https://arrow.apache.org/>
[3]: <https://parquet.apache.org>
[4]: <../python_coprocessor.md>
[5]: <https://github.com/GreptimeTeam/greptimedb/blob/develop/docs/how-to/how-to-write-aggregate-function.md>
