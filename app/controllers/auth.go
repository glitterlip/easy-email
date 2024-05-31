package controllers

import (
	"easyemail/app/models"
	util "easyemail/utils"
	"fmt"
	"github.com/golang-jwt/jwt"
	"github.com/gookit/validate"
	_ "github.com/gookit/validate"
	"github.com/labstack/echo/v4"
	"github.com/spf13/viper"
	"golang.org/x/crypto/bcrypt"
	"log"
	"time"
)

type EEClaims struct {
	Name  string `json:"name"`
	ID    int64  `json:"id"`
	Email string `json:"email"`

	jwt.StandardClaims
}
type UserRequest struct {
	Email    string `json:"email" validate:"required|email" message:"email is invalid"`
	Password string `json:"password" validate:"required"`
}

func Login(c echo.Context) error {

	u := new(UserRequest)
	if err := c.Bind(u); err != nil {
		log.Println(err)
		return util.Error(c, 10400, "login failed", nil, nil, util.ErrorError)
	}
	var user models.User
	_, err := models.DB.Model(&models.User{}).Where("email", u.Email).First(&user)
	if err != nil {
		return util.Error(c, 10400, "user not found", nil, nil, util.ErrorError)
	}
	e := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(u.Password))
	if e != nil {
		fmt.Println(e, user.Password, u.Password)
		return util.Error(c, 10400, "password not match", nil, nil, util.ErrorError)
	}
	claim := jwt.NewWithClaims(jwt.SigningMethodHS256, &EEClaims{
		Name:  user.Name,
		ID:    user.Id,
		Email: user.Email,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(time.Hour * 720).Unix(),
		},
	})
	token, _ := claim.SignedString([]byte(viper.GetString("app.secret")))

	return util.Success(c, nil, map[string]interface{}{
		"access": "user",
		"token":  token,
	})

}
func Register(c echo.Context) error {
	u := new(UserRequest)
	if err := c.Bind(u); err != nil {
		return util.Error(c, 10400, "register failed", nil, nil, util.ErrorError)
	}
	ex, _ := models.DB.Table("users").Where("email", u.Email).Exists()
	if ex {
		return util.Error(c, 10400, "email alerady taken", nil, nil, util.ErrorError)
	}
	v := validate.Struct(u)
	if !v.Validate() {
		return util.Error(c, 10400, "register failed "+v.Errors.One(), nil, nil, util.ErrorError)
	}

	var user models.User

	pb, _ := bcrypt.GenerateFromPassword([]byte(u.Password), 12)
	user.Password = string(pb)
	user.Name = "name"
	user.Email = u.Email
	models.DB.Save(&user)

	claim := jwt.NewWithClaims(jwt.SigningMethodHS256, &EEClaims{
		Name:  user.Name,
		ID:    user.Id,
		Email: user.Email,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(time.Hour * 720).Unix(),
		},
	})
	token, _ := claim.SignedString([]byte(viper.GetString("app.secret")))
	return util.Success(c, nil, map[string]interface{}{
		"access": "user",
		"token":  token,
	})
}
func Info(c echo.Context) error {

	var user models.User
	models.DB.Model(&models.User{}).Where("id", c.Get("id")).First(&user)
	return util.Success(c, nil, map[string]interface{}{
		"user": user,
	})
}
