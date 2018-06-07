package config

import (
	"encoding/json"
	"io/ioutil"
)

var DB string
var Host string

func init() {
	b, err := ioutil.ReadFile("./config.json")
	if err != nil {
		panic(err)
	}
	cfg := make(map[string]string)
	err = json.Unmarshal(b, &cfg)
	if err != nil {
		panic(err)
	}
	DB = cfg["db"]
	Host = cfg["host"]
}
