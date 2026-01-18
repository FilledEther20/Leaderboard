package repository

import (
	"context"

	"github.com/FilledEther20/Leaderboard/internal/models"
	"gorm.io/gorm"
)

type UserRepo interface {
	Search(ctx context.Context, q string, limit int) ([]models.User, error)
	Random(ctx context.Context) (models.User, error)
	UpdateRating(ctx context.Context, id uint, rating int) error
}

type userRepo struct {
	db *gorm.DB
}

func NewUserRepo(db *gorm.DB) UserRepo {
	return &userRepo{db}
}

func (r *userRepo) Search(ctx context.Context, q string, limit int) ([]models.User, error) {
	var users []models.User
	err := r.db.WithContext(ctx).
		Limit(limit).
		Where("username ILIKE ?", "%"+q+"%").
		Find(&users).Error
	return users, err
}

func (r *userRepo) Random(ctx context.Context) (models.User, error) {
	var u models.User
	err := r.db.WithContext(ctx).Order("RANDOM()").First(&u).Error
	return u, err
}

func (r *userRepo) UpdateRating(ctx context.Context, id uint, rating int) error {
	return r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("id = ?", id).
		Update("rating", rating).Error
}
