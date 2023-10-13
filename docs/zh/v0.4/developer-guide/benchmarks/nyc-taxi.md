# NYC 出租车基准测试

这个基准测试是基于[纽约市出租车和豪华轿车委员会](https://www.nyc.gov/site/tlc/index.page)的数据。根据官方网站的信息，数据包括：

> 出租车行程记录包括捕捉上车和下车日期/时间、上车和下车位置、行程距离、详细费用、费率类型、付款方式和司机报告的乘客数量的字段。附带数据集中使用的数据是由在出租车与轿车乘客增强计划（TPEP/LPEP）下获得授权的技术提供商收集和提供给纽约市出租车和豪华轿车委员会（TLC）的。这些行程数据不是由TLC创建的，TLC对这些数据的准确性不作任何声明。

文档中的命令均假设你的当前工作目录为 [GreptimeDB](https://github.com/GreptimeTeam/greptimedb) 源代码的根目录。

## 获取数据

首先，创建测试数据目录
```shell
mkdir -p ./benchmarks/data
```

接下来，你可以在[这个页面](https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page)获取测试数据。我们支持自2022年01月起的所有**黄色出租车行程记录**。例如，要获取2022年1月的数据，你可以运行以下命令：

```shell
curl "https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2022-01.parquet" -o ./benchmarks/data/yellow_tripdata_2022-01.parquet
```

## 运行基准测试

运行基准测试前，请确保你已经启动了 GreptimeDB。你可以通过以下命令启动 GreptimeDB

```shell
cargo run --release standalone start
```

我们的基准工具已包含在源代码中。你可以通过以下方式运行它：

```shell
cargo run --release --bin nyc-taxi -- --path "./benchmarks/data/"
```
