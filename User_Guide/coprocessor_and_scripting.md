# Coprocessor and scripting

## Introduction

We embedded a Python Interpreter in DataBase so you can send python script (with Python 3.10 grammar!) to the database, execute it with column selected from some table, and return whatever execute result is. A example code looks like this:

``` python
@coprocessor(args=["cpu", "mem"], returns=["overheat"])
def measure(cpu: vector, mem: vector):
    overheat = (cpu > 75) & (mem > 60) # construct a new `PyVector<Bool>`
    # here can also contains more complicated code i.e. complex predicates and branches etc.
    return overheat
```

Here `@coprocsessor` is the decorator grammar in python (You can also use `@copr` for short), and `args` being input arguments, the number of `args` must equal the number of parameters of the actual function . For example, in the above code, there are two `args` "cpu"&"mem", and coprocessor will try to extract these two columns with the name of "cpu" & "mem" from given table, then assign them to function `measure`'s two parameters(although their name is irrelevant)

## Advanced Usage

- Type Annotation: one can specify argument&returned types with python grammar like this:

``` python
@copr(args=["cpu", "mem"], returns=["perf", "what"])
def a(cpu: vector[f32], mem: vector[f64])->(vector[f64|None],
    vector[f32]):
    return cpu + mem, cpu - mem
```

This means take column `cpu` of type f32, `mem` column of type f64, return a nullable f64 column and a not nullable f32 column(which is then named "perf" and "what" column)(NOTE: by default a returned variable is cast to a not nullable column, unless you explicitly write something like `vector[f32| None]` to make it nullable)

- Pythonic list comprehension: you can use this pythonic list operation, or index a column(A `vector`) using boolean `vector`, or even use logic operator on two boolean `vector`s:

```python
[a<2 for a in cpu]
# index `cpu` using boolean vector `cpu<0.7`
b = cpu[cpu<0.7]
# rich compare and then `and` two boolean vector
c = (cpu < 0.7) & (mem < 0.5)
```
