package pages

import (
	"html/template"
	"net/http"
)

func catalogueHandler(w http.ResponseWriter, r *http.Request) {
	t, err := template.ParseFiles("public/pages/catalogue.html")

	if err != nil {
		w.WriteHeader(400)
		w.Write([]byte(err.Error()))
		return
	}

	t.Execute(w, struct{}{})
}
