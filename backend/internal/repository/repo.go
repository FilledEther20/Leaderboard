package repository

import (
	"gorm.io/gorm"
)

type Repo struct {
	UserLeaderboard UserRepo
	Leaderboard     LeaderboardRepository
}

func NewRepo(db *gorm.DB, rb RedisClient, leaderboardKey string) *Repo {
	return &Repo{
		UserLeaderboard: NewUserRepo(db),
		Leaderboard:     NewLeaderboardRepo(rb, leaderboardKey),
	}
}
