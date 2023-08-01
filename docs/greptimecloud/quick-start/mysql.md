
### Connect
Connect to GreptimeCloud service instance using mysql CLI.

```shell
mysql --ssl-mode=REQUIRED -u <username> -p <password> -h <host> -P 4002 -A <dbname>
```

### Create a Table

```shell
CREATE TABLE IF NOT EXISTS cpu_metrics (
    hostname STRING,
    environment STRING,
    usage_user DOUBLE,
    usage_system DOUBLE,
    usage_idle DOUBLE,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    TIME INDEX(ts),
    PRIMARY KEY(hostname, environment)
);
```

### Insert Metrics

To quickly get started, we can insert some fake data.

```shell
INSERT INTO cpu_metrics
VALUES
    ('host_0','test',32,58,36,now()),
    ('host_1','test',29,65,20,now()),
    ('host_1','staging',12,32,50,now()),
    ('host_2','staging',67,15,42,now()),
    ('host_2','test',98,5,40,now()),
    ('host_3','test',98,95,7,now()),
    ('host_4','test',32,44,11,now()),
    ('host_0','test',31,57,37,now()-INTERVAL '1 second'),
    ('host_1','staging',11,31,52,now()-INTERVAL '1 second'),
    ('host_1','test',26,68,18,now()-INTERVAL '1 second'),
    ('host_2','staging',66,13,41,now()-INTERVAL '1 second'),
    ('host_2','test',99,6,39,now()-INTERVAL '1 second'),
    ('host_3','test',99,95,7,now()-INTERVAL '1 second'),
    ('host_4','test',31,44,11,now()-INTERVAL '1 second'),
    ('host_0','test',29,58,36,now()-INTERVAL '2 seconds'),
    ('host_1','staging',10,32,50,now()-INTERVAL '2 seconds'),
    ('host_1','test',32,63,22,now()-INTERVAL '2 seconds'),
    ('host_2','staging',65,15,40,now()-INTERVAL '2 seconds'),
    ('host_2','test',100,5,36,now()-INTERVAL '2 seconds'),
    ('host_3','test',93,97,8,now()-INTERVAL '2 seconds'),
    ('host_4','test',31,43,11,now()-INTERVAL '2 seconds'),
    ('host_0','test',31,58,34,now()-INTERVAL '3 seconds'),
    ('host_1','test',34,58,20,now()-INTERVAL '3 seconds'),
    ('host_1','staging',10,31,49,now()-INTERVAL '3 seconds'),
    ('host_2','staging',72,16,36,now()-INTERVAL '3 seconds'),
    ('host_2','test',100,3,36,now()-INTERVAL '3 seconds'),
    ('host_3','test',98,94,5,now()-INTERVAL '3 seconds'),
    ('host_4','test',31,43,11,now()-INTERVAL '3 seconds'),
    ('host_0','test',34,57,37,now()-INTERVAL '4 seconds'),
    ('host_1','test',27,67,19,now()-INTERVAL '4 seconds'),
    ('host_1','staging',13,36,49,now()-INTERVAL '4 seconds'),
    ('host_2','test',98,3,38,now()-INTERVAL '4 seconds'),
    ('host_2','staging',70,13,38,now()-INTERVAL '4 seconds'),
    ('host_3','test',96,96,4,now()-INTERVAL '4 seconds'),
    ('host_4','test',36,44,12,now()-INTERVAL '4 seconds'),
    ('host_0','test',32,51,36,now()-INTERVAL '5 seconds'),
    ('host_1','test',29,76,15,now()-INTERVAL '5 seconds'),
    ('host_1','staging',23,39,49,now()-INTERVAL '5 seconds'),
    ('host_2','test',94,10,30,now()-INTERVAL '5 seconds'),
    ('host_2','staging',76,8,41,now()-INTERVAL '5 seconds'),
    ('host_3','test',90,100,10,now()-INTERVAL '5 seconds'),
    ('host_4','test',32,40,9,now()-INTERVAL '5 seconds');
```
