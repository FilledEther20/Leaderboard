package redis

import (
	"context"
	"log"

	"github.com/redis/go-redis/v9"
)

func InitRedis(dbUrl string) *redis.Client {
	RedisDB := redis.NewClient(&redis.Options{
		Addr:     dbUrl,
		Password: "",
		DB:       0,
		Protocol: 2,
	})
	if _, err := RedisDB.Ping(context.Background()).Result(); err != nil {
		log.Fatal("Failed to connect to Redis:", err)
	}
	return RedisDB
}
