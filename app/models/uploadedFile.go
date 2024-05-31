package models

import (
	"database/sql"
	"github.com/glitterlip/goeloquent"
)

type UploadFile struct {
	*goeloquent.EloquentModel
	Id        int64        `goelo:"column:id;primaryKey" json:"id"`
	UserId    int          `goelo:"column:user_id" json:"user_id"`
	ProjectId int          `goelo:"column:project_id" json:"project_id"`
	FileSize  int64        `goelo:"column:file_size" json:"file_size"`
	Path      string       `goelo:"column:path" json:"path"`
	User      User         `goelo:"BelongsTo:UserRelation" json:"user"`
	CreatedAt sql.NullTime `goelo:"column:created_at;CREATED_AT"`
	UpdatedAt sql.NullTime `goelo:"column:updated_at;UPDATED_AT"`
}

func (u *UploadFile) TableName() string {
	return "upload_file"
}

func (u *UploadFile) UserRelation() *goeloquent.RelationBuilder {
	return u.BelongsTo(u, &User{}, "user_id", "id")
}
