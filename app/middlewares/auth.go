package middlewares

import (
	util "easyemail/utils"
	"fmt"
	"github.com/golang-jwt/jwt"
	"github.com/labstack/echo/v4"
	"github.com/spf13/viper"
	"strings"
)

func Auth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		tokenStr := c.Request().Header.Get("Authorization")
		if len(tokenStr) == 0 {
			tokenStr = "Bearer " + c.QueryParam("token")
		}
		if !strings.Contains(tokenStr, "Bearer") || len(tokenStr) <= 7 {
			return util.Error(c, 10401, "please login first", nil, nil, util.ErrorError)
		}
		token, err := jwt.Parse(strings.ReplaceAll(tokenStr, "Bearer ", ""), func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %s", token.Header["alg"])
			}
			return []byte(viper.GetString("app.secret")), nil
		})
		if err != nil {
			return util.Error(c, 10401, "token err:"+err.Error(), nil, nil, util.ErrorError)
		}
		if _, ok := token.Claims.(jwt.MapClaims); !ok || !token.Valid {
			return util.Error(c, 10401, "token invalid", nil, nil, util.ErrorError)
		}
		claims := token.Claims.(jwt.MapClaims)
		c.Set("id", int64(claims["id"].(float64)))
		return next(c)
	}
}
