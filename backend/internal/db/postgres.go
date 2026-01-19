package db

import (
	"log"

	"github.com/FilledEther20/Leaderboard/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Init(dsn string) *gorm.DB {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("DB cannot be setup", err)
	}
	err = db.AutoMigrate(&models.User{})
	if err != nil {
		log.Fatal("Automigration failed")
	}
	return db
}
