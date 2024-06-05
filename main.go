package main

import (
	"easyemail/providers"
	"embed"
)

var (
	//go:embed resources/spa/dist
	DistFs embed.FS
	//go:embed resources/static
	StaticFs embed.FS
)

var APP *providers.App

func main() {

	APP = providers.NewAPP(&DistFs, &StaticFs)

	APP.Start()

}
