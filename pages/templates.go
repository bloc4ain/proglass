package pages

import "html/template"

var (
	catalogueTemplate *template.Template
	homeTemplate      *template.Template
	loginTemplate     *template.Template
	signupTemplate    *template.Template
	signupSuccessTmpl *template.Template
)

func init() {
	var err error
	if catalogueTemplate, err = template.ParseFiles("public/pages/catalogue.html"); err != nil {
		panic(err)
	}
	if homeTemplate, err = template.ParseFiles("public/pages/home.html"); err != nil {
		panic(err)
	}
	if loginTemplate, err = template.ParseFiles("public/pages/login.html"); err != nil {
		panic(err)
	}
	if signupTemplate, err = template.ParseFiles("public/pages/register.html"); err != nil {
		panic(err)
	}
	if signupSuccessTmpl, err = template.ParseFiles("public/pages/signupsuccess.html"); err != nil {
		panic(err)
	}
}
