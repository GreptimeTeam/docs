# Configuration

GreptimeDB supports **layered configuration** and uses the following precedence order (where each item overrides the one below it):

- Greptime command line options
- Configuration file options
- Environment variables
- Default values

For any settings that not configured, GreptimeDB will assign default values.

## Greptime command line options

Please refer to the [GreptimeDB Command Line Interface](/reference/command-lines.md) to learn how to use the `greptime` command line.

## Configuration file

Configuration can be set in a TOML file.

### Specify configuration file

You can specify the configuration file by using the command line arg `-c [file_path]`.

```sh
greptime [standalone | frontend | datanode | metasrv]  start -c config/standalone.example.toml
```

For example, start the standalone as below:

```bash
greptime standalone start -c standalone.example.toml
```

### Options

Please visit [all available configurations](https://github.com/GreptimeTeam/greptimedb/blob/<%greptimedb-version%>/config/config.md) on GitHub.

### Examples

Below are example configuration files for each GreptimeDB component, which include all available configurations. 
In actual scenarios,
you only need to configure the required options,
do not need to configure all options as in the sample file.

- [standalone](https://github.com/GreptimeTeam/greptimedb/blob/<%greptimedb-version%>/config/standalone.example.toml)
- [frontend](https://github.com/GreptimeTeam/greptimedb/blob/<%greptimedb-version%>/config/frontend.example.toml)
- [datanode](https://github.com/GreptimeTeam/greptimedb/blob/<%greptimedb-version%>/config/datanode.example.toml)
- [flownode](https://github.com/GreptimeTeam/greptimedb/blob/<%greptimedb-version%>/config/flownode.example.toml)
- [metasrv](https://github.com/GreptimeTeam/greptimedb/blob/<%greptimedb-version%>/config/metasrv.example.toml)

## Environment variable

Every item in the configuration file can be mapped into environment variables. For example, if we want to set the configuration item `data_home` of the datanode by environment variable:

```toml
# ...
[storage]
data_home = "/data/greptimedb"
# ...
```

You can use the following shell command to setup the environment variable as the following format:

```
export GREPTIMEDB_DATANODE__STORAGE__DATA_HOME=/data/greptimedb
```

### Environment Variable Rules

- Every environment variable should have the component prefix, for example:

  - `GREPTIMEDB_FRONTEND`
  - `GREPTIMEDB_METASRV`
  - `GREPTIMEDB_DATANODE`
  - `GREPTIMEDB_STANDALONE`

- We use **double underscore `__`** as a separator. For example, the above data structure `storage.data_home` will be transformed to `STORAGE__DATA_HOME`.

The environment variable also accepts list that are separated by a comma `,`, for example:

```
GREPTIMEDB_METASRV__META_CLIENT__METASRV_ADDRS=127.0.0.1:3001,127.0.0.1:3002,127.0.0.1:3003
```
