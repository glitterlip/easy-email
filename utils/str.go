package utils

import (
	"github.com/speps/go-hashids/v2"
	"github.com/spf13/viper"
)

var (
	Hd, _ = hashids.NewWithData(
		&hashids.HashIDData{
			Alphabet:  hashids.DefaultAlphabet,
			MinLength: 8,
			Salt:      viper.GetString("app.secret"),
		})
)

func HashIdEncode(id int64) (res string) {
	res, _ = Hd.EncodeInt64([]int64{id})
	return
}
func HashIdDecode(str string) (res int64) {
	resSlice, err := Hd.DecodeInt64WithError(str)
	if err != nil {
		return 0
	}
	return resSlice[0]
}
