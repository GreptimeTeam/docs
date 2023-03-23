# NYC taxi benchmark

This benchmark is based on the data from [New York City Taxi & Limousine Commission](https://www.nyc.gov/site/tlc/index.page). From the official site, the data includes:

> taxi trip records include fields capturing pick-up and drop-off dates/times, pick-up and drop-off locations, trip distances, itemized fares, rate types, payment types, and driver-reported passenger counts. The data used in the attached datasets were collected and provided to the NYC Taxi and Limousine Commission (TLC) by technology providers authorized under the Taxicab & Livery Passenger Enhancement Programs (TPEP/LPEP). The trip data was not created by the TLC, and TLC makes no representations as to the accuracy of these data.


## Get the data

You can find the data in [this page](https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page). We support all the **Yellow Taxi Trip Records** since 2022-01. For example, to get the data for January 2022, you can run:

```shell
curl "https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2022-01.parquet" -o ./benchmarks/data/yellow_tripdata_2022-01.parquet
```

## Run benchmark

Before running the benchmark, please make sure you have started the GreptimeDB server.

```shell
cargo run --release --datanode start
```

Our benchmark tools is included in the source code. You can run it by:

```shell
cargo run --release --bin nyc-taxi -- --path "./benchmarks/data/"
```
