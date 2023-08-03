
Now we will create a quick start demo step by step to collect host metrics and send them to Greptime. The demo is based on [OTLP/HTTP](https://opentelemetry.io/). For reference, you can view the complete demo on [Github](https://github.com/GreptimeCloudStarters/quick-start-go).

To begin, create a new directory named `quick-start-go` to house our project. Then, run the command `go mod init quick-start` in the directory from your terminal. This will create a `go.mod` file, which is used by Go to manage imports.

Next, create new file named `app.go` and add the following:

```go
package main

import (
	"context"
	"flag"
	"log"
	"os"
	"os/signal"
)

var dbHost = flag.String("host", os.Getenv("DBHOST"), "The host address of the Greptime database")
var db = flag.String("db", os.Getenv("DB"), "The name of the database of the Greptime database")
var username = flag.String("username", os.Getenv("USER"), "The username of the database")
var password = flag.String("password", os.Getenv("PASSWORD"), "The password of the database")

func main() {
	flag.Parse()

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt)
	defer cancel()

	<-ctx.Done()
}
```

The code above parse and get the command line arguments which used to connect to Greptime. Then it creates a context to handle the interrupt signal. Next use Opentelemetry SDK to collect host metrics.

```shell
go get go.opentelemetry.io/otel@v1.16.0 \                                       
    go.opentelemetry.io/contrib/instrumentation/host@v0.42.0 \
    go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp@v0.39.0
```


After the packages installed, update the imports in the `app.go` file.

```go
import (
	"context"
	"encoding/base64"
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"time"

	appHost "go.opentelemetry.io/contrib/instrumentation/host"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp"
	"go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
)
```

Then update the code in the `main` function.

```go
func main() {
	flag.Parse()
	auth := base64.StdEncoding.EncodeToString([]byte(fmt.Sprintf("%s:%s", *username, *password)))
	exporter, err := otlpmetrichttp.New(
		context.Background(),
		otlpmetrichttp.WithEndpoint(*dbHost),
		otlpmetrichttp.WithURLPath("/v1/otlp/v1/metrics"),
		otlpmetrichttp.WithHeaders(map[string]string{
			"x-greptime-db-name": *db,
			"Authorization":      "Basic " + auth,
		}),
		otlpmetrichttp.WithTimeout(time.Second*5),
	)

	if err != nil {
		panic(err)
	}

	reader := metric.NewPeriodicReader(exporter, metric.WithInterval(time.Second*2))

	res := resource.NewWithAttributes(
		semconv.SchemaURL,
		semconv.ServiceName("quick-start-go"),
		semconv.ServiceVersion("v1.0.0"),
	)

	meterProvider := metric.NewMeterProvider(
		metric.WithResource(res),
		metric.WithReader(reader),
	)

	defer func() {
		err := meterProvider.Shutdown(context.Background())
		if err != nil {
			panic(err)
		}
	}()

	log.Print("Sending metrics...")
	err = appHost.Start(appHost.WithMeterProvider(meterProvider))
	if err != nil {
		log.Fatal(err)
	}

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt)
	defer cancel()

	<-ctx.Done()
}
```

The code above creates an OTLP/HTTP exporter and a periodic reader. Then it creates a MeterProvider and starts the host metrics collection. Finally, it waits for the interrupt signal. For more detail about the code, you can refer to [OpenTelemetry Documentation](https://opentelemetry.io/docs/instrumentation/go/).

Now we can run the application like this:

```shell
go run . -host=<host> -db=<dbname> -username=<username> -password=<password>
```
