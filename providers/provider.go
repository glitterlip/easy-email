package providers

type ServiceProvider interface {
	Register(app *App)
}
