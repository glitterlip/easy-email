package providers

import (
	"embed"
	"fmt"
	"github.com/coocood/freecache"
	"github.com/glitterlip/goeloquent"
	"github.com/labstack/echo/v4"
	"github.com/spf13/viper"
	"html/template"
)

type App struct {
	DistFs   *embed.FS
	StaticFs *embed.FS
	Echo     *echo.Echo
	DB       *goeloquent.DB
	Config   *viper.Viper
	View     *template.Template
	Cache    *freecache.Cache

	services map[string]interface{}
}

func (app *App) Start() {
	for _, route := range app.Echo.Routes() {

		fmt.Printf("Route: %s, Method: %s, Path: %s\n", route.Name, route.Method, route.Path)
	}
	app.Echo.Logger.Fatal(app.Echo.Start(":1323"))
}

func (app *App) Bind(name string, service interface{}) {
	app.services[name] = service
}
func (app *App) Resolve(name string) interface{} {
	service, ok := app.services[name]
	if !ok {
		return nil
	}
	return service
}
func NewAPP(distFs *embed.FS, staticFs *embed.FS) *App {
	app := new(App)

	app.StaticFs = staticFs
	app.DistFs = distFs

	app.services = make(map[string]interface{})

	fmt.Println("HttpServiceProvider")
	kernel := new(HttpServiceProvider)
	kernel.Register(app)

	fmt.Println("ConfigServiceProvider")
	config := new(ConfigServiceProvider)
	config.Register(app)

	fmt.Println("ViewServiceProvider")
	view := new(ViewServiceProvider)
	view.Register(app)

	fmt.Println("DatabaseProvider")
	db := new(DatabaseProvider)
	db.Register(app)

	return app
}
