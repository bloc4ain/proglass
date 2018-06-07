package main

import (
	"flag"
	"log"
	"net/http"

	"github.com/bloc4ain/proglass/config"
	"github.com/bloc4ain/proglass/pages"
)

func main() {
	flag.Parse()
	log.Fatal(http.ListenAndServe(config.Host, pages.Router))
}
