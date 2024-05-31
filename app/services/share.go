package services

import (
	"easyemail/app/models"
	"github.com/tidwall/gjson"
)

func CheckPwd(share models.Share, pwd string) bool {
	originPwd := gjson.Get(string(*share.Meta), "password").String()

	if pwd != "" && originPwd != pwd {
		return false
	}

	return true
}

func CheckPermission() {

}
