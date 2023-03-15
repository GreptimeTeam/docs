# Python Coprocessor

## Introduction

Coprocessor, as in TiDB and HBase or Stored Procedure in SQL, is a method to analyze data in local
databases and send it to remote node instead of sending all data to remote node, which then lets
remote do the analysis. This way, a lot of data moving costs are saved. This picture below depicts
how coprocessor works . The `RecordBatch` (Basically a column in table with type and nullability
metadata) can come from anywhere in the database, and returned `RecordBatch` can be annotated in
python grammar to indicate its metadata like type or nullability. Coprocessor will try its best to
convert returned object to a `RecordBatch` , be it a python list, a `RecordBatch` computed from
parameters, or a constant(which is extends to the same length of input arguments)

![Python Coprocessor](../../public/python-coprocessor.png)

## Two optional backends

### CPython Backend powered by PyO3
This Backend is powered by [PyO3](https://pyo3.rs/v0.18.1/), this means you can use your favorite python library (like numpy, pandas, etc.), even using conda to manage your python environment.

But it also comes with some shenanigans, you need to set up correct python shared library, this could a bit tricky, usually you just need to install `python-dev` package, but on macOS you need to set up correct soft link to `Library/Frameworks/Python.framework` if you are using homebrew to install python.

### Embedded RustPython Interpreter

A experimental [python interpreter](https://github.com/RustPython/RustPython) to run
the coprocessor script, it support python 3.10 grammar, but not C API, so no numpy or pandas, but
you can still use all the very pythonic syntax(see [User Guide/Python Coprocessor](/user-guide/python-coprocessor/overview.md) for more!)
