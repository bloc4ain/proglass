package pages

import (
	"html/template"
	"net/http"
)

// NewsTopic struct
type NewsTopic struct {
	Title   string
	Content string
}

// Promotion struct
type Promotion struct {
	Name        string
	Description string
	Image       string
}

// HomePage struct
type HomePage struct {
	News       []NewsTopic
	Promotions []Promotion
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	t, err := template.ParseFiles("public/pages/home.html")

	if err != nil {
		w.WriteHeader(400)
		w.Write([]byte(err.Error()))
		return
	}

	p := HomePage{
		News: []NewsTopic{
			{Title: "New website", Content: "ProGlass Service launched its new website with catalogue"},
			{Title: "Machine", Content: "New glass cutting machine"},
		},
		Promotions: []Promotion{
			{Name: "Product Name", Description: "Product Description", Image: "assets/images/01.jpg"},
			{Name: "Product Name", Description: "Product Description", Image: "assets/images/02.jpg"},
			{Name: "Product Name", Description: "Product Description", Image: "assets/images/03.jpg"},
			{Name: "Product Name", Description: "Product Description", Image: "assets/images/04.jpg"},
			{Name: "Product Name", Description: "Product Description", Image: "assets/images/01.jpg"},
			{Name: "Product Name", Description: "Product Description", Image: "assets/images/02.jpg"},
		},
	}

	t.Execute(w, p)
}
