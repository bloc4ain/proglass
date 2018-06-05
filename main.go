package main

import (
	"flag"
	"log"
	"net/http"

	"github.com/bloc4ain/proglass/pages"
)

func main() {
	flag.Parse()
	log.Fatal(http.ListenAndServe("localhost:5000", pages.CreateRouter()))
}
