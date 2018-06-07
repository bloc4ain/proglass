package pages

import (
	"net/http"
	"sync"
	"time"

	"github.com/satori/go.uuid"

	"github.com/bloc4ain/proglass/user"
)

var sessionManager struct {
	sessions map[string]time.Time
	lock     sync.Mutex
}

func loginPage(w http.ResponseWriter, r *http.Request) {
	if isAuthenticated(r) {
		http.Redirect(w, r, "/", http.StatusFound)
		return
	}
	render(w, r, loginTemplate, nil)
}

func login(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()
	e := r.FormValue("email")
	p := r.FormValue("password")

	if _, err := user.Login(e, p); err != nil {
		render(w, r, loginTemplate, err.Error())
		return
	}

	for {
		s, err := uuid.NewV4()

		if err != nil {
			render(w, r, loginTemplate, err.Error())
			return
		}

		sessionManager.lock.Lock()
		if _, ok := sessionManager.sessions[s.String()]; !ok {
			e := setSession(w, s.String())
			sessionManager.sessions[s.String()] = e
			sessionManager.lock.Unlock()
			break
		}
		sessionManager.lock.Unlock()
	}

	http.Redirect(w, r, "/", http.StatusFound)
}

func logout(w http.ResponseWriter, r *http.Request) {
	sessionManager.lock.Lock()
	delete(sessionManager.sessions, getSession(r))
	sessionManager.lock.Unlock()
	http.SetCookie(w, &http.Cookie{Name: "X-Auth", Expires: time.Now().Add(time.Hour * -1)})
	http.Redirect(w, r, "/", http.StatusFound)
}

func registerPage(w http.ResponseWriter, r *http.Request) {
	if isAuthenticated(r) {
		http.Redirect(w, r, "/", http.StatusFound)
		return
	}
	signupTemplate.Execute(w, nil)
}

func signup(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()
	u := &user.User{
		Email:    r.FormValue("email"),
		Password: r.FormValue("password"),
		Phone:    r.FormValue("phone"),
		Company:  r.FormValue("company"),
		Address:  r.FormValue("address"),
	}
	if err := user.Signup(u); err != nil {
		signupTemplate.Execute(w, err.Error())
		return
	}
	http.Redirect(w, r, "/signupsuccess", 301)
}

func signupSuccessPage(w http.ResponseWriter, r *http.Request) {
	signupSuccessTmpl.Execute(w, nil)
}

func getSession(r *http.Request) string {
	c, err := r.Cookie("X-Auth")
	if err == nil {
		return c.Value
	}
	return ""
}

func setSession(w http.ResponseWriter, s string) time.Time {
	e := time.Now().Add(time.Hour)
	c := &http.Cookie{Name: "X-Auth", Path: "/", Value: s, Expires: e}
	http.SetCookie(w, c)
	return e
}

func isAuthenticated(r *http.Request) bool {
	s := getSession(r)
	if s != "" {
		sessionManager.lock.Lock()
		defer sessionManager.lock.Unlock()
		return sessionManager.sessions[s].After(time.Now())
	}
	return false
}

func initSessions() {
	sessionManager.sessions = make(map[string]time.Time)
	for range time.NewTicker(time.Hour * 24).C {
		sessionManager.lock.Lock()
		now := time.Now()
		for k, v := range sessionManager.sessions {
			if v.Before(now) {
				delete(sessionManager.sessions, k)
			}
		}
		sessionManager.lock.Unlock()
	}
}

func init() {
	go initSessions()
	Router.HandleFunc("/login", loginPage).Methods("GET")
	Router.HandleFunc("/login", login).Methods("POST")
	Router.HandleFunc("/logout", logout).Methods("GET")
	Router.HandleFunc("/register", registerPage).Methods("GET")
	Router.HandleFunc("/register", signup).Methods("POST")
	Router.HandleFunc("/signupsuccess", signupSuccessPage).Methods("GET")
}
