package controllers

import (
	"crypto/tls"
	"easyemail/app/models"
	"easyemail/app/services"
	util "easyemail/utils"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/Boostport/mjml-go"
	_ "github.com/gookit/validate"
	"github.com/jordan-wright/email"
	"github.com/labstack/echo/v4"
	"github.com/spf13/cast"
	"github.com/spf13/viper"
	"net/smtp"
)

func Templates(c echo.Context) error {

	var ts []models.Template
	q := models.DB.Model(&models.Template{})
	if c.QueryParam("type") == "system" {
		q.Where("user_id", 0)
	} else {
		q.Where("user_id", c.Get("id"))
	}
	q.Where("pid", 0)
	p, err := q.Paginate(&ts, cast.ToInt64(c.QueryParam("pageSize")), cast.ToInt64(c.QueryParam("page")))
	if err != nil {
		return util.Error(c, 10400, "Templates not found", nil, nil, util.ErrorError)
	}

	return util.Success(c, ts, map[string]interface{}{
		"current_page": p.CurrentPage,
		"per_page":     p.PerPage,
		"total":        p.Total,
	})

}
func Create(c echo.Context) error {
	var old models.Template
	newT := new(models.Template)

	newT.UserId = cast.ToInt(c.Get("id"))
	m := echo.Map{}
	c.Bind(&m)
	newT.Name = cast.ToString(m["name"])
	old.Id = cast.ToInt64(m["old"])
	if old.Id > 0 {
		if _, err := models.DB.Model(&old).Where("id", old.Id).First(&old); err != nil {
			return util.Error(c, 10404, "Template not found", nil, nil, util.ErrorError)
		}
		if old.UserId != newT.UserId && old.UserId != 0 {
			return util.Error(c, 10404, "Template not found", nil, nil, util.ErrorError)
		}
		if old.UserId != 0 {
			newT.Pid = int(old.Id)
		}
		newT.Content = old.Content
	}
	if m["content"] != nil {
		jsonBytes, _ := json.Marshal(m["content"])
		rawMsg := json.RawMessage(jsonBytes)
		newT.Content = &rawMsg
	}

	models.DB.Save(newT)
	return util.Success(c, nil, newT)
}
func Email(c echo.Context) error {
	var t models.Template
	if _, err := models.DB.Model(&t).With([]string{"Parent", "Children", "Shares"}).Where("id", c.Param("id")).First(&t); err != nil {
		return util.Error(c, 10404, "Template not found", nil, nil, util.ErrorError)
	}
	if t.UserId != cast.ToInt(c.Get("id")) && t.UserId != 0 {
		return util.Error(c, 10404, "Unauthorized", nil, nil, util.ErrorError)
	}
	if t.Pid > 0 {
		siblings := make([]*models.Template, 0)
		models.DB.Model(&models.Template{}).Where("pid", t.Pid).Where("id", "!=", t.Id).Get(&siblings)
		t.Siblings = siblings
	}
	for _, v := range t.Shares {
		v.Link = v.ShareLink()
	}
	return util.Success(c, nil, t)
}
func Update(c echo.Context) error {
	var t models.Template
	if _, err := models.DB.Model(&t).Where("id", c.Param("id")).First(&t); err != nil {
		return util.Error(c, 10404, "Template not found", nil, nil, util.ErrorError)
	}
	if t.UserId != cast.ToInt(c.Get("id")) {
		return util.Error(c, 10404, "Template not found", nil, nil, util.ErrorError)
	}
	m := echo.Map{}
	c.Bind(&m)
	t.Name = cast.ToString(m["name"])
	jsonBytes, _ := json.Marshal(m["content"])
	rawMsg := json.RawMessage(jsonBytes)
	t.Content = &rawMsg
	models.DB.Save(&t)
	return util.Success(c, nil, t)
}

func Send(c echo.Context) error {
	data := echo.Map{}
	c.Bind(&data)
	e := email.NewEmail()
	e.From = viper.GetString("email.from")
	e.To = []string{data["email"].(string)}
	e.Subject = "Test Email sent from EasyEmail for live preview"
	emailStr, err := services.MjmlToHtml(data["content"].(string))
	var mjmlError mjml.Error

	if errors.As(err, &mjmlError) {
		fmt.Println(mjmlError.Message)
		fmt.Println(mjmlError.Details)
		return util.Error(c, 10404, "convert mjml to html failed", nil, nil, util.ErrorError)

	}
	e.HTML = []byte(emailStr)
	var user models.User
	var template models.Template
	models.DB.Model(&template).Where("id", data["id"]).First(&template)
	models.DB.Model(&user).Where("id", c.Get("id")).First(&user)
	if b, err := services.CanSendMail(user, template, data["email"].(string)); b == false && err != nil {
		return util.Error(c, 10404, "current account cant send mail to "+data["email"].(string), nil, nil, util.ErrorError)
	}
	err1 := e.SendWithTLS(viper.GetString("email.address"),
		smtp.PlainAuth("", viper.GetString("email.username"), viper.GetString("email.password"), viper.GetString("email.host")), &tls.Config{
			ServerName: viper.GetString("email.host"),
		})
	if err1 != nil {
		fmt.Println(err1.Error())
		return util.Error(c, 10404, "send failed", nil, nil, util.ErrorError)
	}

	return util.Success(c, nil, nil)
}

func ToHtml(c echo.Context) error {
	data := echo.Map{}
	c.Bind(&data)
	emailStr, err := services.MjmlToHtml(data["content"].(string))
	var mjmlError mjml.Error

	if errors.As(err, &mjmlError) {
		fmt.Println(mjmlError.Message)
		fmt.Println(mjmlError.Details)
		return util.Error(c, 10500, "convert mjml to html failed:"+mjmlError.Message, nil, nil, util.ErrorError)

	}
	return util.Success(c, nil, map[string]interface{}{
		"html": emailStr,
	})
}

func CreateBlock(c echo.Context) error {
	block := new(models.CustomBlock)

	block.UserId = int64(cast.ToInt(c.Get("id")))
	m := echo.Map{}
	c.Bind(&m)
	if m["meta"] != nil {
		jsonBytes, _ := json.Marshal(m["meta"])
		rawMsg := json.RawMessage(jsonBytes)
		block.Meta = &rawMsg
	}

	if m["content"] != nil {
		jsonBytes, _ := json.Marshal(m["content"])
		rawMsg := json.RawMessage(jsonBytes)
		block.Content = &rawMsg
	}

	models.DB.Save(block)
	return util.Success(c, nil, block)
}
func Blocks(c echo.Context) error {
	var bs []models.CustomBlock
	models.DB.Model(&models.CustomBlock{}).Where("user_id", c.Get("id")).Get(&bs)
	return util.Success(c, bs, nil)
}
