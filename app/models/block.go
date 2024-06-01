package models

import (
	"database/sql"
	"encoding/json"
	"github.com/glitterlip/goeloquent"
)

type CustomBlock struct {
	*goeloquent.EloquentModel
	Id        int64            `goelo:"column:id;primaryKey" json:"id"`
	UserId    int64            `goelo:"column:user_id" json:"user_id"`
	Meta      *json.RawMessage `goelo:"column:meta" json:"meta"`
	Content   *json.RawMessage `goelo:"column:content" json:"content"`
	User      *User            `goelo:"BelongsTo:UserRelation" json:"user"`
	CreatedAt sql.NullTime     `goelo:"column:created_at;CREATED_AT" json:"created_at"`
	UpdatedAt sql.NullTime     `goelo:"column:updated_at;UPDATED_AT" json:"updated_at"`
}

func (c *CustomBlock) TableName() string {
	return "block"
}

func (c *CustomBlock) UserRelation() *goeloquent.RelationBuilder {
	return c.BelongsTo(c, &User{}, "user_id", "id")
}
