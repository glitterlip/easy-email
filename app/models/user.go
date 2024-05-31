package models

import (
	"database/sql"
	"github.com/glitterlip/goeloquent"
)

type User struct {
	*goeloquent.EloquentModel
	Id        int64        `goelo:"column:id;primaryKey" json:"id"`
	Name      string       `goelo:"column:name" json:"name"`
	Email     string       `goelo:"column:email" json:"email"`
	Password  string       `goelo:"column:password" json:"password"`
	CreatedAt sql.NullTime `goelo:"column:created_at;CREATED_AT"`
	UpdatedAt sql.NullTime `goelo:"column:updated_at;UPDATED_AT"`
}

func (u *User) TableName() string {
	return "users"
}
