package main

import (
	"easyemail/app/models"
	"easyemail/routes"
	"fmt"
	"github.com/glitterlip/goeloquent"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/pkg/errors"
	"github.com/spf13/viper"
	"net/http"
	"strings"
)

func main() {

	// read config
	viper.AddConfigPath("./config")
	viper.SetConfigType("yaml")
	viper.SetConfigName("app")
	err := viper.ReadInConfig()
	if err != nil {
		panic(errors.New("no config"))
	}
	//init DB
	models.DB = goeloquent.Open(map[string]goeloquent.DBConfig{
		"default": {
			Driver:    goeloquent.DriverMysql,
			Dsn:       viper.GetString("database.dsn"),
			EnableLog: true,
		},
	})
	models.DB.SetLogger(func(log goeloquent.Log) {
		fmt.Println(log)
	})

	goeloquent.RegistMorphMap(map[string]interface{}{
		"users": &models.User{},
	})

	goeloquent.RegisterModels([]interface{}{&models.User{}})
	E := echo.New()
	E.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format:           `[${time_custom}] ["${remote_ip}"] [${status}] [${method}] [${uri}] [${error}] [time:${latency_human}] [in:${bytes_in}] [out:${bytes_out}]` + "\n" + `[ua:${user_agent}]` + "\n",
		CustomTimeFormat: "01-02 15:04:05",
		Skipper: func(c echo.Context) bool {
			path := c.Path()
			notOk := c.Response().Status != http.StatusOK
			return notOk || strings.Contains(path, "/static") || strings.Contains(path, "/static") || strings.Contains(path, "favicon.ico")
		},
	}))
	E.Use(middleware.RecoverWithConfig(middleware.RecoverConfig{
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
	routes.ApiRoute(E)

	E.Logger.Fatal(E.Start(":1323"))

}
