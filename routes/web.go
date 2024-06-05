package routes

import (
	"easyemail/app/controllers"
	"github.com/labstack/echo/v4"
)

func WebRoute(e *echo.Echo) {

	e.GET("/", controllers.Index).Name = "index"
}
