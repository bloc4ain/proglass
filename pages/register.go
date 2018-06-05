package pages

import (
	"html/template"
	"net/http"
)

func registerHandler(w http.ResponseWriter, r *http.Request) {
	t, err := template.ParseFiles("public/pages/register.html")

	if err != nil {
		w.WriteHeader(400)
		w.Write([]byte(err.Error()))
		return
	}

	t.Execute(w, struct{}{})
}

func signinHandler(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "/", 301)
}
