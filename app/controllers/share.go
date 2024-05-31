package controllers

import (
	"database/sql"
	"easyemail/app/models"
	util "easyemail/utils"
	"encoding/json"
	"github.com/labstack/echo/v4"
	"github.com/spf13/cast"
	"github.com/tidwall/gjson"
	"regexp"
	"time"
)

func Share(c echo.Context) error {

	data := echo.Map{}
	c.Bind(&data)
	var t models.Template
	var s models.Share
	if _, err := models.DB.Model(&t).Where("id", data["id"]).First(&t); err != nil {
		return util.Error(c, 10404, "Template not found", nil, nil, util.ErrorError)
	}
	if t.UserId != cast.ToInt(c.Get("id")) {
		return util.Error(c, 10401, "Template not found", nil, nil, util.ErrorError)
	}
	s.UserId = cast.ToInt64(c.Get("id"))
	s.TemplateId = cast.ToInt64(data["id"])
	days := cast.ToInt64(data["expiration"])
	if days > 0 {
		s.InvalidatedAt = sql.NullTime{Time: time.Now().Add(time.Hour * time.Duration(24*days)), Valid: true}
	}
	if data["password"] != nil {
		if match, err := regexp.MatchString(`^[a-zA-Z0-9]*$`, cast.ToString(data["password"])); err != nil || !match {
			return util.Error(c, 10404, "Password not valid", nil, nil, util.ErrorError)
		}
	}

	if cast.ToStringSlice(data["permissions"]) == nil || len(cast.ToStringSlice(data["permissions"])) == 0 {
		return util.Error(c, 10404, "Permissions not valid", nil, nil, util.ErrorError)
	}

	jsonBytes, _ := json.Marshal(map[string]interface{}{
		"password":    data["password"],
		"permissions": data["permissions"],
	})
	rawMsg := json.RawMessage(jsonBytes)
	s.Meta = &rawMsg
	models.DB.Save(&s)
	s.Link = s.ShareLink()
	return util.Success(c, nil, s)
}

func Detail(c echo.Context) error {
	data := echo.Map{}
	c.Bind(&data)
	id := util.HashIdDecode(data["id"].(string))
	var share models.Share
	_, err := models.DB.Model(&models.Share{}).Where("id", id).With("Template").First(&share)
	if err != nil || share.Id == 0 {
		return util.Error(c, 10404, "Share not found", nil, nil, util.ErrorError)
	}

	if share.InvalidatedAt.Valid && share.InvalidatedAt.Time.Before(time.Now()) {
		return util.Error(c, 10419, "Share expired", nil, nil, util.ErrorError)
	}

	pwd := gjson.Get(string(*share.Meta), "password").String()

	if pwd != "" && pwd != data["password"].(string) {
		return util.Error(c, 10401, "Password not match", nil, nil, util.ErrorError)
	}
	share.Link = share.ShareLink()
	return util.Success(c, nil, share)
}
func Fork(c echo.Context) error {
	data := echo.Map{}
	c.Bind(&data)
	id := util.HashIdDecode(data["id"].(string))
	var share models.Share
	_, err := models.DB.Model(&models.Share{}).Where("id", id).With("Template").First(&share)
	if err != nil || share.Id == 0 {
		return util.Error(c, 10404, "Share not found", nil, nil, util.ErrorError)
	}

	if share.InvalidatedAt.Valid && share.InvalidatedAt.Time.Before(time.Now()) {
		return util.Error(c, 10419, "Share expired", nil, nil, util.ErrorError)
	}

	pwd := gjson.Get(string(*share.Meta), "password").String()

	if pwd != "" && pwd != data["password"].(string) {
		return util.Error(c, 10401, "Password not match", nil, nil, util.ErrorError)
	}

	var t models.Template
	t.UserId = cast.ToInt(c.Get("id"))
	t.Name = share.Template.Name
	t.Content = share.Template.Content
	t.Meta = share.Template.Meta
	models.DB.Save(&t)
	return util.Success(c, nil, t)

}
