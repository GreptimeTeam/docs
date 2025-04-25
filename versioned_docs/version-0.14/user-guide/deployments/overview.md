---
keywords: [deployment, configuration, authentication, Kubernetes, Android, capacity planning, GreptimeCloud]
description: Overview of deploying GreptimeDB, including configuration, authentication, Kubernetes deployment, running on Android, capacity planning, and using GreptimeCloud.
---

# Deployments

## Configuration

Before deploying GreptimeDB, you need to [configure the server](configuration.md) to meet your requirements. This includes setting up protocol options, storage options, and more.

## Authentication

By default, GreptimeDB does not have authentication enabled. Learn how to [configure authentication](./authentication/overview.md) for your deployment manually.

## Deploy on Kubernetes

The step-by-step instructions for [deploying GreptimeDB on a Kubernetes cluster](./deploy-on-kubernetes/overview.md).

## Run on Android

Learn how to [run GreptimeDB on Android devices](run-on-android.md).

## Capacity plan

Understand how to [plan for capacity](/user-guide/administration/capacity-plan.md) to ensure your GreptimeDB deployment can handle your workload.

## GreptimeCloud

Instead of managing your own GreptimeDB cluster,
you can use [GreptimeCloud](https://greptime.cloud) to manage GreptimeDB instances, monitor metrics, and set up alerts.
GreptimeCloud is a cloud service powered by fully-managed serverless GreptimeDB, providing a scalable and efficient solution for time-series data platforms and Prometheus backends.
For more information, see the [GreptimeCloud documentation](https://docs.greptime.com/nightly/greptimecloud/overview).
