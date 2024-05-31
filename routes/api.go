package routes

import (
	"easyemail/app/controllers"
	"easyemail/app/middlewares"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func ApiRoute(e *echo.Echo) {
	apiRoute := e.Group("/api")
	apiRoute.Use(middleware.CORS())
	auth := apiRoute.Group("/auth")
	auth.POST("/login", controllers.Login)
	auth.POST("/register", controllers.Register)
	auth.GET("/user", controllers.Info, middlewares.Auth)

	email := apiRoute.Group("/email")
	email.GET("/templates/:id", controllers.Email, middlewares.Auth)
	email.GET("/templates", controllers.Templates, middlewares.Auth)
	email.POST("/create", controllers.Create, middlewares.Auth)
	email.POST("/share/create", controllers.Share, middlewares.Auth)
	email.POST("/share/detail", controllers.Detail)
	email.POST("/share/fork", controllers.Fork, middlewares.Auth)
	email.POST("/templates/:id", controllers.Update, middlewares.Auth)
	email.POST("/send", controllers.Send, middlewares.Auth)
	email.POST("/html", controllers.ToHtml, middlewares.Auth)

	storage := apiRoute.Group("/file")
	storage.POST("/upload", controllers.Upload, middlewares.Auth)
}
