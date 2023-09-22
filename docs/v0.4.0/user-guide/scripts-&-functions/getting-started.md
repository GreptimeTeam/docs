# Getting Started

## Installation

### Create python environment

Using conda to create a python 3 environment. Conda is a great tool for managing Python environments, see [official docs](https://docs.conda.io/en/latest/miniconda.html) to get more information.

```shell
conda create --name Greptime python=3
conda activate Greptime
```

### Install GreptimeDB

Please refer to [Installation](/getting-started/try-out-greptimedb.md#Installation).

## Hello world example

Let's begin with a hello world example:

```python
@coprocessor(returns=['msg'])
def hello() -> vector[str]:
   return "Hello, GreptimeDB"
```

Save it as `hello.py`, then post it by [HTTP API](./function.md#http-api):

### Submit the Python Script to GreptimeDB

```sh
curl --data-binary "@hello.py" -XPOST "http://localhost:4000/v1/scripts?name=hello&db=public"
```

Then call it in SQL:
```sql
select hello();
```
```sql
+-------------------+
| hello()           |
+-------------------+
| Hello, GreptimeDB |
+-------------------+
1 row in set (1.77 sec)
```

Or call it by  [HTTP API](./function.md#http-api):
```sh
curl -XPOST "http://localhost:4000/v1/run-script?name=hello&db=public"
```
```json
{
  "code": 0,
  "output": [
    {
      "records": {
        "schema": {
          "column_schemas": [
            {
              "name": "msg",
              "data_type": "String"
            }
          ]
        },
        "rows": [
          [
            "Hello, GreptimeDB"
          ]
        ]
      }
    }
  ],
  "execution_time_ms": 1917
}
```

The function `hello` is a coprocessor with an annotation `@coprocessor`.
The `returns` in `@coprocessor`  specifies the return column names by the coprocessor and generates the final schema of output:
```json
       "schema": {
          "column_schemas": [
            {
              "name": "msg",
              "data_type": "String"
            }
          ]
        }
```
               
The  `-> vector[str]` part after the argument list specifies the return types of the function. They are always vectors with concrete types. The return types are required to generate the output of the coprocessor function.

The function body of `hello` returns a literal string: `"Hello, GreptimeDB"`.The Coprocessor engine will cast it into a vector of constant string and return it.

A coprocessor contains three main parts in summary:
* The `@coprocessor` annotation.
* The function input and output.
* The function body.

We can call a coprocessor in SQL like a SQL UDF(User Defined Function) or call it by HTTP API.


## SQL example

Save your python code for complex analysis (like the following one which determines the load status by cpu/mem/disk usage) into a file (here its named `system_status.py`):

``` python
@coprocessor(args=["host", "idc", "cpu_util", "memory_util", "disk_util"],
             returns = ["host", "idc", "status"],
             sql = "SELECT * FROM system_metrics")
def system_status(hosts, idcs, cpus, memories, disks)\
    -> (vector[str], vector[str], vector[str]):
    statuses = []
    for host, cpu, memory, disk in zip(hosts, cpus, memories, disks):
        if cpu > 80 or memory > 80 or disk > 80:
            statuses.append("red")
            continue

        status = cpu * 0.4 + memory * 0.4 + disk * 0.2

        if status > 80:
            statuses.append("red")
        elif status > 50:
            statuses.append("yello")
        else:
            statuses.append("green")


    return hosts, idcs, statuses

```

The above piece of code evaluates the host status based on the cpu/memory/disk usage. Arguments come from querying data from `system_metrics` specified by parameter `sql` in `@coprocessor` annotation (here is = `"SELECT * FROM system_metrics"`). The query result is assigned to each positional argument with corresponding names in `args=[...]`, then the function returns three variables, which are converted back into three columns `returns = ["host", "idc", "status"]`.

### Submit the Python Script to GreptimeDB

You can submit the file to GreptimeDB with a script name so you can refer to it by this name(`system_status`) later and execute it:

```shell
curl  --data-binary "@system_status.py" \
   -XPOST "http://localhost:4000/v1/scripts?name=system_status&db=greptime.public"
```

Run the script:

```shell
curl  -XPOST \
 "http://localhost:4000/v1/run-script?name=system_status&db=public"
```

Getting the results in `json` format:

``` json
{
   "code":0,
   "output":{
      "records":{
         "schema":{
            "column_schemas":[
               {
                  "name":"host",
                  "data_type":"String"
               },
               {
                  "name":"idc",
                  "data_type":"String"
               },
               {
                  "name":"status",
                  "data_type":"String"
               }
            ]
         },
         "rows":[
            [
               "host1",
               "idc_a",
               "green"
            ],
            [
               "host1",
               "idc_b",
               "yello"
            ],
            [
               "host2",
               "idc_a",
               "red"
            ]
         ]
      }
   }
}
```

For more information about python coprocessor, please refer to [Function](./function.md) for more information.
