package models

import (
	"database/sql"
	"github.com/glitterlip/goeloquent"
)

type User struct {
	*goeloquent.EloquentModel
	Id        int64          `goelo:"column:id;primaryKey" json:"id"`
	Name      string         `goelo:"column:name" json:"name"`
	Email     string         `goelo:"column:email" json:"email"`
	Password  string         `goelo:"column:password" json:"password"`
	Templates []*Template    `goelo:"HasMany:TemplatesRelation" json:"templates"`
	Blocks    []*CustomBlock `goelo:"HasMany:BlocksRelation" json:"blocks"`
	CreatedAt sql.NullTime   `goelo:"column:created_at;CREATED_AT"`
	UpdatedAt sql.NullTime   `goelo:"column:updated_at;UPDATED_AT"`
}

func (u *User) TableName() string {
	return "users"
}
func (u *User) TemplatesRelation() *goeloquent.RelationBuilder {
	return u.HasMany(u, &Template{}, "id", "user_id")
}
func (u *User) BlocksRelation() *goeloquent.RelationBuilder {
	return u.HasMany(u, &CustomBlock{}, "id", "user_id")
}
