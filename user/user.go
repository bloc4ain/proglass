package user

import (
	"errors"
	"log"
	"time"

	"github.com/bloc4ain/proglass/config"
	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
)

// User struct
type User struct {
	ID            string    `bson:"id"`
	Email         string    `bson:"email"`
	Password      string    `bson:"password"`
	Phone         string    `bson:"phone"`
	Company       string    `bson:"company"`
	Address       string    `bson:"address"`
	Created       time.Time `bson:"created"`
	EmailVerified bool      `bson:"emailVerified"`
	Approved      bool      `bson:"approved"`
	Deleted       bool      `bsoj:"deleted"`
}

var session *mgo.Session

var (
	ErrInternalError         = errors.New("Internal error")
	ErrInvalidCredentials    = errors.New("Invalid email or password")
	ErrUserAlreadyRegistered = errors.New("User with this email already registered")
)

func Login(email, password string) (*User, error) {
	q := bson.M{
		"email":         email,
		"password":      password,
		"emailVerified": true,
		"approved":      true,
		"deleted":       false,
	}
	s := bson.M{
		"ID":            1,
		"Email":         1,
		"Phone":         1,
		"Company":       1,
		"Address":       1,
		"Created":       1,
		"EmailVerified": 1,
		"Approved":      1,
		"Deleted":       1,
	}
	u := new(User)
	err := session.DB("proglass").C("users").Find(q).Select(s).One(u)

	if err == mgo.ErrNotFound {
		return nil, ErrInvalidCredentials
	}
	if err != nil {
		log.Panicln(err)
		return nil, ErrInternalError
	}
	return u, nil
}

func Signup(u *User) error {
	if u == nil {
		return errors.New("Empty user")
	}
	if u.Email == "" {
		return errors.New("Empty email")
	}
	if u.Password == "" {
		return errors.New("Empty password")
	}
	if u.Phone == "" {
		return errors.New("Empty phone")
	}
	if u.Company == "" {
		return errors.New("Empty company")
	}
	if u.Address == "" {
		return errors.New("Empty address")
	}

	u.Created = time.Now()
	u.EmailVerified = false
	u.Approved = false
	u.Deleted = false

	q := bson.M{
		"email":    u.Email,
		"password": u.Password,
	}
	c, err := session.DB("proglass").C("users").Find(q).Count()

	if err != nil {
		log.Panicln(err)
		return ErrInternalError
	}
	if c > 0 {
		return ErrUserAlreadyRegistered
	}

	if err := session.DB("proglass").C("users").Insert(u); err != nil {
		return ErrInternalError
	}

	return nil
}

func init() {
	var err error
	if session, err = mgo.Dial(config.DB); err != nil {
		panic(err)
	}
}
