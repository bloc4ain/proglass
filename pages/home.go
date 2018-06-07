package pages

import (
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

func homePage(w http.ResponseWriter, r *http.Request) {
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

	render(w, r, homeTemplate, p)
}

func init() {
	Router.HandleFunc("/", homePage)
}
