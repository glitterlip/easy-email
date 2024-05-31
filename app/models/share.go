package models

import (
	"database/sql"
	"easyemail/utils"
	"encoding/json"
	"github.com/glitterlip/goeloquent"
	"github.com/tidwall/gjson"
)

type Share struct {
	*goeloquent.EloquentModel
	Id            int64            `goelo:"column:id;primaryKey" json:"id"`
	TemplateId    int64            `goelo:"column:template_id" json:"template_id"`
	UserId        int64            `goelo:"column:user_id" json:"user_id"`
	Meta          *json.RawMessage `goelo:"column:meta" json:"meta"`
	User          *User            `goelo:"BelongsTo:UserRelation" json:"user"`
	Template      *Template        `goelo:"BelongsTo:TemplateRelation" json:"template"`
	CreatedAt     sql.NullTime     `goelo:"column:created_at;CREATED_AT" json:"created_at"`
	UpdatedAt     sql.NullTime     `goelo:"column:updated_at;UPDATED_AT" json:"updated_at"`
	InvalidatedAt sql.NullTime     `goelo:"column:invalidated_at" json:"invalidated_at"`
	Link          string           `json:"link"`
}
type SharePermission string

const (
	Comment SharePermission = "comment"
	View    SharePermission = "view"
	Fork    SharePermission = "fork"
	Edit    SharePermission = "edit"
)

func (t *Share) HasPermission(p SharePermission) bool {
	isArray := gjson.Get(string(*t.Meta), "permissions").IsArray()
	if !isArray {
		return false
	}
	for _, v := range gjson.Get(string(*t.Meta), "permissions").Array() {
		if v.String() == string(p) {
			return true
		}
	}
	return false
}
func (t *Share) TableName() string {
	return "share"
}

func (t *Share) UserRelation() *goeloquent.RelationBuilder {
	return t.BelongsTo(t, &User{}, "user_id", "id")
}
func (t *Share) TemplateRelation() *goeloquent.RelationBuilder {
	return t.BelongsTo(t, &Template{}, "template_id", "id")
}
func (t *Share) ShareLink() string {
	return utils.HashIdEncode(t.Id)
}
