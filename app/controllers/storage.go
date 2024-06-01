package controllers

import (
	"context"
	"easyemail/app/models"
	"easyemail/utils"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/labstack/echo/v4"
	"github.com/spf13/cast"
	"github.com/spf13/viper"
	"path/filepath"
	"strings"
	"time"
)

func Upload(c echo.Context) error {
	var bucketName = viper.GetString("storage.bucket")
	var accountId = viper.GetString("storage.accountid")
	var accessKeyId = viper.GetString("storage.accesskey")
	var accessKeySecret = viper.GetString("storage.secretkey")
	r2Resolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			URL: fmt.Sprintf("https://%s.r2.cloudflarestorage.com", accountId),
		}, nil
	})
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithEndpointResolverWithOptions(r2Resolver),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKeyId, accessKeySecret, "")),
		config.WithRegion("auto"),
	)
	endpoint := viper.GetString("storage.endpoint")
	cfg.BaseEndpoint = &endpoint
	if err != nil {
		return utils.Error(c, 10500, fmt.Sprintf("upload config failed:%v", err), nil, nil, utils.ErrorError)
	}

	client := s3.NewFromConfig(cfg)

	file, err := c.FormFile("file")

	src, err := file.Open()
	if err != nil {
		return utils.Error(c, 10500, fmt.Sprintf("file open failed:%v", err), nil, nil, utils.ErrorError)
	}
	defer src.Close()

	id := cast.ToInt(c.Get("id"))
	filename := fmt.Sprintf("%d-%d%s", c.Get("id"), time.Now().UnixMilli(), filepath.Ext(file.Filename))
	p := fmt.Sprintf("%03d/%03d/%03d/%s/%s/%s", id/1000000, (id/1000)%1000, id%1000, time.Now().Format("20060102"), c.FormValue("type"), filename)

	_, err = client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(p),
		Body:   src,
	})
	if err != nil {
		return utils.Error(c, 10400, fmt.Sprintf("file upload failed:%v", err), nil, nil, utils.ErrorError)
	} else {
		fmt.Println(p)
	}
	var u models.UploadFile
	u.UserId = cast.ToInt(c.Get("id"))
	u.Path = strings.Replace(p, viper.GetString("storage.endpoint"), "", 1)
	u.FileSize = file.Size

	models.DB.Save(&u)

	return utils.Success(c, nil, map[string]interface{}{
		"path": fmt.Sprintf("%s/%s", viper.GetString("storage.endpoint"), p),
	})
}
