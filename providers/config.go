package providers

import (
	"github.com/pkg/errors"
	"github.com/spf13/viper"
)

type ConfigServiceProvider struct {
}

func (c *ConfigServiceProvider) Register(app *App) {
	v := viper.New()
	v.AddConfigPath("../config")
	v.AddConfigPath("../")
	v.AddConfigPath("./")
	v.AddConfigPath("./config")
	v.SetConfigType("yaml")
	v.SetConfigName("app")
	err := v.ReadInConfig()
	if err != nil {
		panic(errors.New("no config"))
	}
	app.Config = v
}
