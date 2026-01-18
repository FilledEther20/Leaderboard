package repository

import (
	"gorm.io/gorm"
)

type Repo struct {
	UserLeaderboard UserRepo
	Leaderboard     LeaderboardRepository
}

func NewRepo(db *gorm.DB, rb RedisClient) *Repo {
	return &Repo{
		UserLeaderboard: NewUserRepo(db),
		Leaderboard:     NewLeaderboardRepo(rb),
	}
}
