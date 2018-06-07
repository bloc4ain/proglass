package pages

import (
	"net/http"
)

func cataloguePage(w http.ResponseWriter, r *http.Request) {
	render(w, r, catalogueTemplate, nil)
}

func init() {
	Router.HandleFunc("/catalogue", cataloguePage)
}
