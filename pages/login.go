package pages

import (
	"html/template"
	"net/http"
)

func loginPage(w http.ResponseWriter, r *http.Request) {
	t, err := template.ParseFiles("public/pages/login.html")

	if err != nil {
		w.WriteHeader(400)
		w.Write([]byte(err.Error()))
		return
	}

	t.Execute(w, struct{}{})
}

func login(w http.ResponseWriter, r *http.Request) {
	t, err := template.ParseFiles("public/pages/login.html")

	if err != nil {
		w.WriteHeader(400)
		w.Write([]byte(err.Error()))
		return
	}

	t.Execute(w, struct{}{})
}
