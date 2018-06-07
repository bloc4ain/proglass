package main

import (
	"flag"
	"log"
	"net/http"

	"github.com/bloc4ain/proglass/pages"
)

func main() {
	flag.Parse()
	log.Fatal(http.ListenAndServe(":8080", pages.CreateRouter()))
}
