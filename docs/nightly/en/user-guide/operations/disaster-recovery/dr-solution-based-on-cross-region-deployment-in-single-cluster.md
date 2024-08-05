# DR Solution Based on Cross-Region Deployment in a Single Cluster

## How disaster recovery works in GreptimeDB
GreptimeDB is well-suited for cross-region disaster recovery. You may have varying regional characteristics and business needs, and GreptimeDB offers tailored solutions to meet these diverse requirements.

GreptimeDB resource management involves the concept of Availability Zones (AZs). An AZ is a logical unit of disaster recovery.
It can be a Data Center (DC), a compartment of a DC. This depends on your specific DC conditions and deployment design.

A GreptimeDB region is a city. When two DC are in the same region and one DC becomes unavailable, the other DC can take over the services of the unavailable DC. This is a localization strategy.

### Across 2 regions, data in the same region

![DR-across-2dc-1region](/DR-across-2dc-1region.png)

In this solution, the data is in one region (2 DCs), while the metadata across 2 regions.

DC1 and DC2 are used together to handle read and write services, while DC3 (located in region2) is a replica used to meet the majority protocol. This architecture is also called the "2-2-1" solution.

Both DC1 and DC2 must be able to handle all requests in extreme situations, so please ensure that sufficient resources are allocated.

Features:
    - 2ms latency in the same region
    - 30ms latency in two regions

Supports High Availability:
    - A single AZ is unavailable with the same performance
    - A single DC is unavailable with almost the same performance


If you want a regional-level disaster recovery solution, you can take it a step further by providing read and write services on DC3. So, the next solution is:

### Data across 2 regions

![DR-across-3dc-2region](/DR-across-3dc-2region.png)

In this solution, the data across 2 regions.

Each DC must be able to handle all requests in extreme situations, so please ensure that sufficient resources are allocated.

Features:
    - 2ms latency in the same region
    - 30ms latency in two regions

Supports High Availability:
    - A single AZ is unavailable with the same performance
    - A single DC is unavailable with degraded performance

If you can't tolerate performance degradation from a single DC failure, consider upgrading to the five-DC and three-region solution.

### Across 3 regions, data across 2 regions

![DR-across-5dc-2region](/DR-across-5dc-2region.png)

In this solution, the data across 2 regions, while the metadata across 3 regions.

Region1 and region2 are used together to handle read and write services, while region3 is a replica used to meet the majority protocol. This architecture is also called the "2-2-1" solution.

Each of the two adjacent regions must be able to handle all requests in extreme situations, so please ensure that sufficient resources are allocated.

Features:
    - 2ms latency in the same region
    - 7ms latency in two adjacent regions
    - 30ms latency in two distant regions

Supports High Availability:
    - A single AZ is unavailable with the same performance
    - A single DC is unavailable with the same performance
    - A single region(city) is unavailable with the degraded performance

You can take it a step further by providing read and write services on both 3 regions. So, the next solution is:
(This solution may have higher latency, so if that's unacceptable, it's not recommended.)

### Data across 3 regions

![DR-across-5dc-3region](/DR-across-5dc-3region.png)

In this solution, the data across 3 regions.

In the event of a failure in one region, the other two regions must be able to handle all requests, so please ensure sufficient resources are allocated.

Features:
    - 2ms latency in the same region
    - 7ms latency in two adjacent regions
    - 30ms latency in two distant regions

Supports High Availability:
    - A single AZ is unavailable with the same performance
    - A single DC is unavailable with the same performance
    - A single region(city) is unavailable with degraded performance
