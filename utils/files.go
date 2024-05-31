package utils

import (
	"crypto/md5"
	"encoding/hex"
	"io"
	"os"
)

func MD5(file *os.File) (string, error) {

	hash := md5.New()
	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}

	hashBytes := hash.Sum(nil)
	md5String := hex.EncodeToString(hashBytes)

	return md5String, nil
}
