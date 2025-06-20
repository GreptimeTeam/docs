---
keywords: [GreptimeDB CLI, command-line interface, installation, starting services, upgrading versions, command line tools, CLI reference]
description: Comprehensive overview of the GreptimeDB command-line interface, including installation instructions, available commands, global options, and practical examples for starting services and managing GreptimeDB instances.
---

# Overview

The `greptime` command can start/stop GreptimeDB and pass configuration options. 

## Install the Greptime CLI

The Greptime CLI comes bundled with the GreptimeDB binary.
After [installing GreptimeDB](/getting-started/installation/overview.md),
you can execute the `./greptime` command within the GreptimeDB directory.

For convenience, if you wish to run commands using `greptime` instead of `./greptime`,
consider moving the CLI binary to your system's `bin` directory or appending the binary's path to your `PATH` environment variable.

## CLI Options

The `help` command lists all available commands and options of `greptime`.

```sh
$ greptime help
Usage: greptime [OPTIONS] <COMMAND>

Commands:
  datanode    Start datanode service
  flownode    Start flownode service
  frontend    Start frontend service
  metasrv     Start metasrv service
  standalone  Run greptimedb as a standalone service
  cli         Execute the cli tools for greptimedb
  help        Print this message or the help of the given subcommand(s)

Options:
      --log-dir <LOG_DIR>
      --log-level <LOG_LEVEL>
  -h, --help                   Print help
  -V, --version                Print version
```

### Global options

| Option                    | Description                                                |
| ------------------------- | ---------------------------------------------------------- |
| `-h`/`--help`             | Print help information                                     |
| `-V`/`--version`          | Print version information                                  |
| `--log-dir <LOG_DIR>`     | The logging directory, default is `./greptimedb_data/logs` |
| `--log-level <LOG_LEVEL>` | The logging level, default is `info`                       |

### Subcommands 
- [Metasrv](/reference/command-lines/metasrv.md)
- [Datanode](/reference/command-lines/datanode.md)
- [Flownode](/reference/command-lines/flownode.md)
- [Frontend](/reference/command-lines/frontend.md)
- [Standalone](/reference/command-lines/standalone.md)

### Upgrade GreptimeDB version

Please refer to [the upgrade steps](/user-guide/deployments-administration/upgrade.md)
