package main

import (
	"github.com/FilledEther20/Leaderboard/internal/config"
	"github.com/FilledEther20/Leaderboard/internal/db"
	"github.com/FilledEther20/Leaderboard/internal/handler"
	"github.com/FilledEther20/Leaderboard/internal/redis"
	"github.com/FilledEther20/Leaderboard/internal/repository"
	"github.com/FilledEther20/Leaderboard/internal/router"
	"github.com/FilledEther20/Leaderboard/internal/seed"
	"github.com/FilledEther20/Leaderboard/internal/service"
)

func main() {
	cfg := config.NewConfig()
	dbConn := db.Init(cfg.PostgresDSN)
	rdb := redis.InitRedis(cfg.ReddisAddr)

	seed.Run(dbConn, rdb, cfg.LeaderboardKey)
	repo := repository.NewRepo(dbConn, rdb, cfg.LeaderboardKey)
	svc := service.New(repo)
	h := handler.New(svc)

	r := router.Setup(h)
	r.Run(":8080")
}
