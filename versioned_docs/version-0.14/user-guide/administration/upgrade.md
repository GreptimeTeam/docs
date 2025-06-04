---
keywords: [GreptimeDB upgrade, upgrade example]
description: Introduce how to upgrade GreptimeDB to the latest version, including some incompatible changes and specific upgrade steps.
---

# Upgrade

## How to Upgrade GreptimeDB

If your currently deployed GreptimeDB version is v0.12 or higher, v0.14 is fully compatible with existing database configurations and data formats, allowing for a direct upgrade. If you are using a version prior to v0.12, it is recommended to first refer to the v0.12 upgrade documentation to upgrade your database to v0.12, and then upgrade to v0.14, to ensure compatibility and a smooth transition.


## Minimizing Business Impact During Upgrade

Before upgrading GreptimeDB,
it is essential to perform a comprehensive backup of your data to safeguard against potential data loss.
This backup acts as a safety measure in the event of any issues during the upgrade process.

To minimize business impact during the upgrade, consider the following optional best practices:

- **Rolling Upgrade:** Utilize [rolling upgrades](https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/) on Kubernetes to update GreptimeDB instances incrementally.
This approach replaces old instances with new ones while maintaining service availability and minimizing downtime.
- **Automatic Retries:** Configure client applications to enable automatic retries with exponential backoff.
This helps handle temporary service interruptions gracefully.
- **Temporary Pause of Write Operations:** For applications that can tolerate brief maintenance windows,
consider pausing write operations during the upgrade to ensure data consistency.
- **Double Writing:** Implement double writing to both the old and new versions of GreptimeDB,
then switch to the new version once you have verified that it is functioning correctly.
This allows you to verify data consistency and gradually redirect read traffic to the upgraded version.

