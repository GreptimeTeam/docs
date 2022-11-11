# Process Data with Python

## Introduction

GreptimeDB supports running Python script inside the database. If the business logic is complex to express via SQL, you can use python.

Save your python code for complex analysis (like the following one which determines the load status by cpu/mem/disk usage) into a file (here its named `system_status.py`):

``` python
@coprocessor(args=["host", "idc", "cpu_util", "memory_util", "disk_util"],
             returns = ["host", "idc", "status"],
             sql = "SELECT * FROM system_metrics")
def system_status(hosts, idcs, cpus, memories, disks):
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

The above piece of code evaluates the host status based on the cpu/memory/disk usage. Arguments comes from querying data from `system_metrics` specified by parameter `sql` in `@coprocessor` annotation(here is = `"SELECT * FROM system_metrics"`). The query result is assigned to each positional argument with corresponding names in `args=[...]`, then the function return three variable, which is convert back into three column `returns = ["host", "idc", "status"]`.

## Submit the Python Script to GreptimeDB

You can submit the file to GreptimeDB with a script name so you can refer to it by this name(`system_status`)later and execute it:

``` shell
curl  --data-binary "@system_status.py" -XPOST "http://localhost:3000/v1/scripts?name=system_status"
```

Run the script:

```shell
curl  -XPOST "http://localhost:3000/v1/run-script?name=system_status"
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
