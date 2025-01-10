---
keywords: [EMQX, MQTT, IoT, data ingestion, GreptimeCloud]
description: Instructions on configuring GreptimeCloud as a data sink in EMQX Platform for IoT data ingestion.
---

# EMQX Platform

[EMQX Platform](https://www.emqx.io/) is an MQTT Gateway, designed to handle
massive amounts of IoT device connections and message traffic, making it a
popular choice for building large-scale IoT applications. It has built-in
support for GreptimeDB as a data integration. By adding GreptimeDB as a Data
Persistent sink, you can ingest EMQX messages into GreptimeDB automatically.

You will need to follow these steps for your complete IoT data link, from MQTT
to database:

- Sign up your account on [EMQX Platform](https://www.emqx.io/)
- Create a **Dedicated Instance** and wait for it's up and running
- Setup Private Link or NAT Gateway for your deployment so it has internet
  access
- Go to **Data Integrations** and find **GreptimeDB**
- Configure your **GreptimeDB** connector using following information
  - Server host: `<host>:4001`
  - Database: `<dbname>`
  - Username: `<username>`
  - Password: `<password>`

Then you are all set. Start from using EMQX's debugging tools to generate data
and check GreptimeDB Dashboard for the data ingested.
