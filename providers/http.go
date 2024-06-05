package providers

import (
	"easyemail/app/controllers"
	"easyemail/routes"
	"fmt"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"net/http"
	"strings"
)

type HttpServiceProvider struct {
}

func (h *HttpServiceProvider) Register(app *App) {
	app.Echo = echo.New()
	app.Echo.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format:           `[${time_custom}] ["${remote_ip}"] [${status}] [${method}] [${uri}] [${error}] [time:${latency_human}] [in:${bytes_in}] [out:${bytes_out}]` + "\n" + `[ua:${user_agent}]` + "\n",
		CustomTimeFormat: "01-02 15:04:05",
		Skipper: func(c echo.Context) bool {
			path := c.Path()
			notOk := c.Response().Status != http.StatusOK
			return notOk || strings.Contains(path, "/static") || strings.Contains(path, "/static") || strings.Contains(path, "favicon.ico")
		},
	}))
	app.Echo.Use(middleware.RecoverWithConfig(middleware.RecoverConfig{
		Skipper: func(c echo.Context) bool {
			return false
		},
		StackSize:         4 << 10, // 4 KB
		DisableStackAll:   false,
		DisablePrintStack: false,
		LogLevel:          0,
		LogErrorFunc: func(c echo.Context, err error, stack []byte) error {
			fmt.Println(err.Error())
			fmt.Println(string(stack))
			return err
		},
	}))
	routes.WebRoute(app.Echo)
	routes.ApiRoute(app.Echo)

	app.Echo.GET("/", controllers.Index)
	app.Echo.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		HTML5:      true,
		Root:       "resources/spa/dist",
		Filesystem: http.FS(app.DistFs),
		Skipper: func(c echo.Context) bool {
			return c.Path() == "/"
		},
	}))
}
