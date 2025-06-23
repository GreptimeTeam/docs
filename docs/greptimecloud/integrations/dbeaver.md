---
keywords: [DBeaver, MySQL, database connection, database tool, GreptimeCloud]
description: Guide on using DBeaver to connect to GreptimeCloud via MySQL database drivers.
---

# DBeaver

[DBeaver](https://dbeaver.io/) is a free, open-source, and cross-platform database tool that supports all popular databases. It is a popular choice among developers and database administrators for its ease of use and extensive feature set.

You can use DBeaver to connect to GreptimeDB via MySQL database drivers.
Click the "New Database Connection" button in the DBeaver toolbar to create a new connection to GreptimeDB.

Select MySQL and click "Next" to configure the connection settings.
Install the MySQL driver if you haven't already.
Input the following connection details:

- Connect by Host
- Host: `<host>`
- Port: `4002`
- Database: `<dbname>`
- Enter the `<username>` and `<password>`

Click "Test Connection" to verify the connection settings and click "Finish" to save the connection.

For more information on interacting with GreptimeDB using MySQL, refer to the [MySQL protocol documentation](https://docs.greptime.com/user-guide/protocols/mysql).
