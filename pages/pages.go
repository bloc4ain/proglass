package pages

import (
	"net/http"

	"github.com/gorilla/mux"
)

// CreateRouter func
func CreateRouter() *mux.Router {
	r := mux.NewRouter()

	r.HandleFunc("/", homeHandler)
	r.HandleFunc("/catalogue", catalogueHandler)
	r.HandleFunc("/register", registerHandler)
	r.HandleFunc("/signin", signinHandler).Methods("POST")

	r.HandleFunc("/login", loginPage).Methods("GET")
	r.HandleFunc("/login", login).Methods("POST")

	r.PathPrefix("/").Handler(http.FileServer(http.Dir("public")))
	return r
}
