---
keywords: [ES, Elasticsearch, GreptimeDB, QueryDSL]
description: GreptimeDB 企业版所支持的 QueryDSL 语法
---

# 概述

由于 GreptimeDB 和 Elasticsearch 的设计的目的有多不同，有众多的功能无法兼容，我们尽可能地提供了相应的替代方案。在各个具体的接口中，我们会说明 GreptimeDB 的实现方式和 Elasticsearch 的区别。

:::tip
所有与 boost 分数相关的功能都不支持。

不会自动增加并维护 `_id` 字段。如需使用，需在原始数据中包含该字段。

不支持使用 @timestamp 作为时间字段。

不允许在同一个请求中同时包含 query 和 aggregation
:::

## 查询语法

### match

在 GreptimeDB 中，`match` 查询用于匹配文本字段中的一个或多个词。

不支持 analyzer，auto_generate_synonyms_phrase_query，fuzziness，max_expansions，prefix_length，
fuzzy_transpositions，fuzzy_rewrite，lenient，operator，minimum_should_match，zero_terms_query。

### match_phrase

在 GreptimeDB 中，`match_phrase` 查询用于匹配文本字段中的一个短语。会根据查询的数据类型来生成不同的查询，当数据类型为文本时，他会转化为 like 查询。
当数据类型为其他类型时，他会转化为相应的等值查询。

不支持 analyzer，auto_generate_synonyms_phrase_query，fuzziness，max_expansions，prefix_length，
fuzzy_transpositions，fuzzy_rewrite，lenient，operator，minimum_should_match，zero_terms_query。

### match_all

在 GreptimeDB 中，`match_all` 查询用于匹配所有文档。

### term

在 GreptimeDB 中，`term` 查询用于匹配文本字段中的一个精确值。主要将查询转化为等值查询。

目前不支持 case_insensitive

### prefix

在 GreptimeDB 中，`prefix` 查询用于匹配文本字段中的一个前缀。主要将查询转为为一个 like 查询。
比如你查询以 `yi` 开头的文本，实际会转化为 `LIKE 'yi%'` 的形式。

不支持 rewrite，case_insensitive

### range

在 GreptimeDB 中，`range` 查询用于匹配文本字段中的一个范围。主要将查询转化为大于等于和小于等于的条件。

目前不支持 format，relation，time_zone，boost

### exists

在 GreptimeDB 中，`exists` 查询用于匹配文本字段中存在的值。主要将查询转化为是否存在的条件。

### bool

在 GreptimeDB 中，`bool` 查询用于匹配多个查询条件。主要将查询转化为 AND 和 OR 的组合条件。
