# DBeaver

DBeaver is a free, open-source, and cross-platform database tool that supports all popular databases. It is a popular choice among developers and database administrators for its ease of use and extensive feature set.

You can use DBeaver to connect to GreptimeDB via MySQL and PostgreSQL database drivers.
Click the "New Database Connection" button in the DBeaver toolbar to create a new connection to GreptimeDB.

## MySQL

Select MySQL and click "Next" to configure the connection settings.
Install the MySQL JDBC driver if you haven't already.
Input the following connection details:

- Connect by Host
- Host: `localhost` if GreptimeDB is running on your local machine
- Port: `4002` if you use the default GreptimeDB configuration
- Database: `public`, you can use any other database name you have created
- Enter the username and password if authentication is enabled on GreptimeDB; otherwise, leave them blank.

Click "Test Connection" to verify the connection settings and click "Finish" to save the connection.

For more information on interacting with GreptimeDB using MySQL, refer to the [MySQL protocol documentation](/user-guide/protocols/mysql.md).

## PostgreSQL

Select PostgreSQL and click "Next" to configure the connection settings.
Install the PostgreSQL JDBC driver if you haven't already.
Input the following connection details:

- Connect by Host
- Host: `localhost` if GreptimeDB is running on your local machine
- Port: `4003` if you use the default GreptimeDB configuration
- Database: `public`, you can use any other database name you have created
- Input the username and password if you have enabled authentication, otherwise leave them blank

Click "Test Connection" to verify the connection settings and click "Finish" to save the connection.

For more information on interacting with GreptimeDB using PostgreSQL, refer to the [PostgreSQL protocol documentation](/user-guide/protocols/postgresql.md).

