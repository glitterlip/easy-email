package providers

import (
	"github.com/coocood/freecache"
	"runtime/debug"
)

type CacheServiceProvider struct {
}

func (c *CacheServiceProvider) Register(app *App) {
	app.Cache = freecache.NewCache(1024 * 1024 * 1024)
	debug.SetGCPercent(20)

}
