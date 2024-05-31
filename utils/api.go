package utils

import "github.com/labstack/echo/v4"

type ErrorShowType int

const (
	ErrorSilent   ErrorShowType = 0
	ErrorWarning  ErrorShowType = 1
	ErrorError    ErrorShowType = 2
	ErrorRedirect ErrorShowType = 9
)

func Success(c echo.Context, data interface{}, meta interface{}) error {
	return c.JSON(200, map[string]interface{}{
		"success":      true,
		"data":         data,
		"meta":         meta,
		"errorCode":    0,
		"errorMessage": "",
		"showType":     0,
		"traceId":      "",
	})
}
func Error(c echo.Context, code int, message string, data interface{}, meta interface{}, showType ErrorShowType) error {
	return c.JSON(200, map[string]interface{}{
		"success":      false,
		"data":         data,
		"meta":         meta,
		"errorCode":    code,
		"errorMessage": message,
		"showType":     showType,
		"traceId":      "",
	})
}
