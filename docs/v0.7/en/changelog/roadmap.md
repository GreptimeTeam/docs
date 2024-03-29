# What to Expect Next? GreptimeDB Roadmap for 2024

Since GreptimeDB's open-sourcing on November 15th, 2022, we have stepped on the committed journey towards crafting a fast and efficient data infrastructure. This endeavor has been propelled by the collaborative efforts of both our dedicated team and the vibrant community that supports us.

As we embark on the inaugural season of 2024, a leap year enriched by an extra day in February, this year promises to be thrilling as we anticipate numerous groundbreaking developments. These crucial updates will significantly showcase the maturity of our product within production environments, presenting practical benchmarks for users to compare with leading time-series databases in the industry.

As we forge ahead with GreptimeDB 2024, it prompts the question, "What's next?" This roadmap outlines the objectives our team is pursuing and the visions we harbor for our collective community. 

- Providing clarity on what the community can expect from GreptimeDB for the next 10-12 months;
- Offering insights to those wishing to contribute to GreptimeDB on GitHub by highlighting potential starting points and the types of projects we are eager to embark on.

Read the updated roadmap in [this issue](https://github.com/GreptimeTeam/greptimedb/issues/3412). 

## Main Feature Updates in 2024

The evolution of GreptimeDB in 2024 is marked by a suite of main feature updates. These enhancements are a testament to our ongoing commitment to excellence, driven by feedback from our community and the latest requirements in real-world scenarios.

Our roadmap for the year includes significant advancements that promise to elevate the capabilities of GreptimeDB and enrich the user experience. 

Here's a glimpse into what we have in store:

- [Metric Engine](https://github.com/GreptimeTeam/greptimedb/blob/main/docs/rfcs/2023-07-10-metric-engine.md)

    - Tracking issue: https://github.com/GreptimeTeam/greptimedb/issues/3187

    - A new engine designed for observability scenarios. Its primary aim is to handle a large number of small tables, making it particularly suitable using Prometheus metrics. By utilizing synthetic wide tables, this new Engine offers the capability to store metric data and reuse metadata, rendering "tables" atop it more lightweight and overcoming some of the limitations of the existing Mito engine, which is considered too heavy for such tasks.
  
- [GreptimeFlow](https://github.com/GreptimeTeam/greptimedb/blob/main/docs/rfcs/2024-01-17-dataflow-framework.md)

    - Tracking issue: https://github.com/GreptimeTeam/greptimedb/issues/3187
    - A lightweight stream computing component capable of performing continuous aggregation on GreptimeDB data streams. It can be embedded into the GreptimeDB Frontend or deployed as a separate service within the GreptimeDB cluster.
    - A flow job can be submitted in the form of SQL:

    ```sql
    CREATE TASK avg_over_5m WINDOW_SIZE = "5m" AS
        SELECT avg(value) FROM table
        WHERE time > now() - 5m GROUP BY time(1m);
    ```

- Index
    - [Inverted Index](https://github.com/GreptimeTeam/greptimedb/blob/main/docs/rfcs/2023-11-03-inverted-index.md)
        - Tracking issue: https://github.com/GreptimeTeam/greptimedb/issues/2705
    - Smart Index
        - For instance, it automatically monitors workloads and query performance, and when necessary, it autonomously creates relevant indexes and removes unused ones.
    - Spatial Index
        - Supports storage and retrieval of geographic location information.
    
- Cluster Management & Autopilot
    - [Region Migration](https://github.com/GreptimeTeam/greptimedb/blob/main/docs/rfcs/2023-11-07-region-migration.md)
        - Tracking issue: https://github.com/GreptimeTeam/greptimedb/issues/2700
        - It offers the capability to migrate Regions between Datanodes, facilitating the relocation of hot data and the horizontal scaling of load balancing.
    - Auto Rebalance Regions
        - An automated load balancing scheduler built upon Region Migration.

- Logs Engine
    -  A storage engine designed specifically for the characteristics of log data, sharing most of GreptimeDB's architecture and capabilities, such as the SQL query layer, data sharding, distributed routing, and querying indexing, and compression ability. This enables GreptimeDB to become a unified system offering optimized storage and a consistent access experience for both Metrics and Logs data, based on a multi-engine architecture.


## GreptimeDB Version Plan

With all the feature updates listed above, we've made the version iteration plan for GreptimeDB in 2024.

The image below presents the GreptimeDB 2024 Roadmap, showcasing a structured release schedule and the pivotal feature enhancements planned for deployment throughout the year. Please note that these details are tentative and subject to refinement.

![version iteration plan](/version-plan1.png)

Track the progress of GreptimeDB versions [here](https://github.com/GreptimeTeam/greptimedb/milestones).

GreptimeDB v1.0 marks a milestone as a production-ready release, boasting advanced features such as Smart Index, setting a new standard for efficiency and performance.

Here we enthusiastically invite you to mark your calendar and experience the robust capabilities of GreptimeDB v1.0 (scheduled to be released in August) to boost your time-series data management and analysis.

**March: GreptimeDB v0.7**

- Region Migration
- Inverted Index
- Metrics Engine

**April: GreptimeDB v0.8**

- GreptimeFlow

**June: GreptimeDB v0.9**

- Auto Rebalance Regions

**August: GreptimeDB v1.0**

- Smart Index
- Spatial Index

**December: GreptimeDB v1.1**

- Logs Engine: Data ingestion from popular log collectors


## Get Involved Now

If anything above draws your attention, don't hesitate to star us on [GitHub](https://github.com/GreptimeTeam/greptimedb) or GreptimeDB Community on [Slack](https://www.greptime.com/slack). Also, you can go to our [contribution page](https://github.com/GreptimeTeam/greptimedb/contribute) to find some interesting issues to start with.

Looking beyond the initiatives that are in progress, there's a lot of room for improvement. We also welcome other ideas besides these planned updates. If you might be interested in giving that a try, speak up and chat with the team. We probably will end up being the ones who get you the best.