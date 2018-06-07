package pages

import (
	"fmt"
	"html/template"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

// Router router
var Router = mux.NewRouter()

func init() {
	Router.PathPrefix("/").Handler(http.FileServer(http.Dir("public")))
	Router.HandleFunc("/_ah/health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "ok")
	})
}

type page struct {
	Authenticated bool
	Data          interface{}
}

func render(w http.ResponseWriter, r *http.Request, t *template.Template, d interface{}) {
	p := page{isAuthenticated(r), d}
	log.Println(p)
	t.Execute(w, &p)
}
