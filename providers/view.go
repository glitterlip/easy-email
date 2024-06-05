package providers

import (
	"embed"
	"fmt"
	"github.com/labstack/echo/v4"
	"html/template"
	"io"
	"io/fs"
)

type ViewServiceProvider struct {
	templates *template.Template
}

func (v *ViewServiceProvider) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	return v.templates.ExecuteTemplate(w, name, data)
}

func (v *ViewServiceProvider) Register(app *App) {
	v.templates = template.New("view")
	path := "resources/static/views"
	v.templates.ParseFS(*app.StaticFs, path+"/*.html")

	entries, _ := app.StaticFs.ReadDir(path)
	for _, entry := range entries {
		if entry.IsDir() {
			walkDir(v, *app.StaticFs, path+"/"+entry.Name())
		} else {
			fmt.Printf("parsed:%s/%s\n", path, entry.Name())
		}
	}

	fmt.Println(v.templates.DefinedTemplates())
	app.Echo.Renderer = v
}

func walkDir(v *ViewServiceProvider, fileSystem embed.FS, path string) {
	_, err := v.templates.ParseFS(fileSystem, path+"/*.html")
	if err != nil {
		panic(fmt.Sprintf("parse error:%s", err.Error()))
	}
	entries, _ := fs.ReadDir(fileSystem, path)
	for _, entry := range entries {
		if entry.IsDir() {
			walkDir(v, fileSystem, path+"/"+entry.Name())
		} else {
			fmt.Printf("parsed:%s/%s\n", path, entry.Name())
		}
	}
}
