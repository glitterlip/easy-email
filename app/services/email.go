package services

import (
	"context"
	"easyemail/app/models"
	"github.com/Boostport/mjml-go"
)

func CanSendMail(user models.User, template models.Template, email string) (res bool, err error) {

	if template.UserId == 0 {

		return true, nil
	}

	return true, nil
}
func MjmlToHtml(source string) (html string, err error) {
	return mjml.ToHTML(context.Background(), source, mjml.WithMinify(true))
}
