---
keywords: [Python scripts, data analysis, CPython backend, RustPython interpreter, RecordBatch]
description: Guide on using Python scripts for data analysis in GreptimeDB, including backend options and setup instructions.
---

# Python Scripts

## Introduction

Python scripts are methods for analyzing data in GreptimeDB,
by running it in the database directly instead of fetching all the data from the database and running it locally.
This approach saves a lot of data transfer costs.
The image below depicts how the script works.
The `RecordBatch` (which is basically a column in a table with type and nullability metadata)
can come from anywhere in the database,
and the returned `RecordBatch` can be annotated in Python grammar to indicate its metadata,
such as type or nullability.
The script will do its best to convert the returned object to a `RecordBatch`,
whether it is a Python list, a `RecordBatch` computed from parameters,
or a constant (which is extended to the same length as the input arguments).

![Python Coprocessor](/python-coprocessor.png)

## Two optional backends

### CPython Backend powered by PyO3

This backend is powered by [PyO3](https://pyo3.rs/v0.18.1/), enabling the use of your favourite Python libraries (such as NumPy, Pandas, etc.) and allowing Conda to manage your Python environment.

But using it also involves some complications. You must set up the correct Python shared library, which can be a bit challenging. In general, you just need to install the `python-dev` package. However, if you are using Homebrew to install Python on macOS, you must create a proper soft link to `Library/Frameworks/Python.framework`. Detailed instructions on using PyO3 crate with different Python Version can be found [here](https://pyo3.rs/v0.18.1/building_and_distribution#configuring-the-python-version)

### Embedded RustPython Interpreter

An experiment [python interpreter](https://github.com/RustPython/RustPython) to run
the coprocessor script, it supports Python 3.10 grammar. You can use all the very Python syntax, see [User Guide/Python Coprocessor](/user-guide/python-scripts/overview.md) for more!
