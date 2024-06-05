package providers

import (
	"easyemail/app/models"
	"fmt"
	"github.com/glitterlip/goeloquent"
)

type DatabaseProvider struct {
}

func (d *DatabaseProvider) Register(app *App) {
	app.DB = goeloquent.Open(map[string]goeloquent.DBConfig{
		"default": {
			Driver:    goeloquent.DriverMysql,
			Dsn:       app.Config.GetString("database.dsn"),
			EnableLog: true,
		},
	})
	app.DB.SetLogger(func(log goeloquent.Log) {
		fmt.Println(log)
	})
	models.DB = app.DB

	goeloquent.RegistMorphMap(map[string]interface{}{
		"users": &models.User{},
	})

	goeloquent.RegisterModels([]interface{}{&models.User{}})
}
