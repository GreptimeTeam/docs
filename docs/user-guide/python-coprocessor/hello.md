Let's begin with a hello world example:

```python
@coprocessor(returns=['msg'])
def hello() -> vector[str]:
   return "Hello, GreptimeDB"
```

Save it as `hello.py`, then post it by [HTTP API](../supported-protocols/http-api#scripts-and-run-script):
```sh
curl  --data-binary "@hello.py" -XPOST "http://localhost:4000/v1/scripts?name=hello&db=public"
```

Then call it in SQL:
```sql
select hello() as msg;
```
```sql
+-------------------+
| msg               |
+-------------------+
| Hello, GreptimeDB |
+-------------------+
1 row in set (0.01 sec)
```

Or call it by  [HTTP API](../supported-protocols/http-api#scripts-and-run-script):
```sh
curl  -XPOST "http://localhost:4000/v1/run-script?name=hello&db=public"
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
               
The  `-> vector[str]` part after the argument list specifies the return types of the function. They are always vectors with concrete types. The return types are optional; the Coprocessor Engine can infer them. **But If you want to call the coprocessor in SQL, you must always specify them.**

The function body of `hello` returns a literal string: `"Hello, GreptimeDB"`.The Coprocessor engine will cast it into a  vector of constant string and return it.

A coprocessor contains three main parts in summary:
* The `@coprocessor` annotation.
* The function input and output.
* The function body.
We can call a coprocessor in SQL like a SQL UDF(User Defined Function) or call it by HTTP API.

We will cover them in the following chapters.