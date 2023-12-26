# Architecture

![architecture](/architecture-2.png)

In order to form a robust database cluster and keep complexity at an acceptable
level, there are three main components in GreptimeDB architecture: Datanode,
Frontend and Metasrv.

- [**Metasrv**](/contributor-guide/metasrv/overview.md) is the central command of
  GreptimeDB cluster. In typical deployment, at least three nodes is required to
  setup a reliable _Metasrv_ mini-cluster. _Meta_ manages database and table
  information, including how data spread across the cluster and where to route
  requests to. It also keeps monitoring availability and performance of \_Datanode_s,
  to ensure its routing table is valid and up-to-date.
- [**Frontend**](/contributor-guide/frontend/overview.md) is a stateless
  component that can scale to as many as needed. It accepts incoming request,
  authenticates it, translates it from various protocols into GreptimeDB
  cluster's internal one, and forwards to certain \_Datanode_s under guidance from Metasrv.
- [**Datanodes**](/contributor-guide/datanode/overview.md) hold regions of
  tables and data in Greptime DB cluster. It accepts read and write request sent
  from _Frontend_, and executes it against its data.

These three components will be combined as GreptimeDB standalone mode, for local or embedded development.

You can refer to [architecture](/contributor-guide/overview.md) in developer guide to learn more details about how components work together.
