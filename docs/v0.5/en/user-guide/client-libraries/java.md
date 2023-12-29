---
template: template.md
---
# Java

<docs-template>

{template ingester-lib-installation%


%}

{template ingester-lib-connect%

%}

{template row-object%

The Java ingester SDK uses `Row` to represent a row data item. Multiple `Row`s can be added to a `Table` object and then written to GreptimeDB.

%}


{template create-a-rows%

```java



```

%}

{template create-rows%

```java


```

%}


{template save-rows%

```java



```

%}

{template update-rows%

```java
// save a row data


// update the row data

// The same tag `host1`

// The same time index `1703832681000`

// The new field value `0.80`

// overwrite the existing data

```
%}


{template recommended-query-library%

<!-- We recommend using the [Gorm](https://gorm.io/) library, which is popular and developer-friendly. -->

%}

{template query-library-installation%


%}

{template query-library-connect%

#### MySQL

```java

```

#### PostgreSQL

```java


```

%}

{template query-library-raw-sql%

```java

```

%}

{template query-lib-link%

<!-- [GORM](https://gorm.io/docs/index.html) -->

%}

</docs-template>
