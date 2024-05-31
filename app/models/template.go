package models

import (
	"database/sql"
	"encoding/json"
	"github.com/glitterlip/goeloquent"
)

type Template struct {
	*goeloquent.EloquentModel
	Id        int64            `goelo:"column:id;primaryKey" json:"id"`
	Name      string           `goelo:"column:name" json:"name"`
	Content   *json.RawMessage `goelo:"column:content" json:"content"`
	UserId    int              `goelo:"column:user_id" json:"user_id"`
	Pid       int              `goelo:"column:pid" json:"pid"`
	CreatedAt sql.NullTime     `goelo:"column:created_at;CREATED_AT" json:"created_at"`
	UpdatedAt sql.NullTime     `goelo:"column:updated_at;UPDATED_AT" json:"updated_at"`
	Meta      *json.RawMessage `goelo:"column:meta" json:"meta"`
	Shares    []*Share         `goelo:"HasMany:SharesRelation" json:"shares"`
	Parent    *Template        `goelo:"BelongsTo:ParentRelation" json:"parent"`
	Children  []*Template      `goelo:"HasMany:ChildrenRelation" json:"children"`
	Siblings  []*Template      `json:"siblings"`
}

func (t *Template) TableName() string {
	return "template"
}

func (t *Template) User() *goeloquent.RelationBuilder {
	return t.BelongsTo(t, &User{}, "user_id", "id")
}
func (t *Template) SharesRelation() *goeloquent.RelationBuilder {
	return t.HasMany(t, &Share{}, "id", "template_id")
}
func (t *Template) ParentRelation() *goeloquent.RelationBuilder {
	return t.BelongsTo(t, &Template{}, "pid", "id")
}
func (t *Template) ChildrenRelation() *goeloquent.RelationBuilder {
	return t.HasMany(t, &Template{}, "id", "pid")
}
