package seed

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/FilledEther20/Leaderboard/internal/config"
	"github.com/FilledEther20/Leaderboard/internal/models"
	"github.com/brianvoe/gofakeit/v6"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

const seedCount = 10000

func Run(db *gorm.DB, rdb *redis.Client) {
	ctx := context.Background()
	log.Println("Cleaning Up...")

	rdb.Del(ctx, config.LeaderboardKey)
	if err := db.Exec("TRUNCATE TABLE users RESTART IDENTITY CASCADE").Error; err != nil {
		log.Fatalf("Failed to truncate table: %v", err)
	}

	log.Println("Seeding users ...")
	gofakeit.Seed(time.Now().UnixNano())

	users := make([]models.User, 0, 1000)
	pipe := rdb.Pipeline()

	for i := 0; i < seedCount; i++ {
		username := fmt.Sprintf(
			"%s_%s_%d",
			gofakeit.FirstName(),
			gofakeit.LastName(),
			i,
		)
		rating := rand.Intn(4901) + 100

		users = append(users, models.User{
			Username: username,
			Rating:   rating,
		})

		pipe.ZAdd(ctx, config.LeaderboardKey, redis.Z{
			Score:  float64(rating),
			Member: username,
		})

		if len(users) == 1000 {
			db.Create(&users)
			pipe.Exec(ctx)

			users = users[:0]
			pipe = rdb.Pipeline()
		}
	}
	log.Println("Seeding completed.")
}
