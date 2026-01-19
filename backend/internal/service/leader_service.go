package service

import (
	"context"
	"log"
	"math/rand"

	"github.com/FilledEther20/Leaderboard/internal/repository"
)

type UserRankResponse struct {
	Username   string  `json:"username"`
	Rating     float64 `json:"rating"`
	GlobalRank int64   `json:"global_rank"`
}

type LeaderboardService struct {
	repo *repository.Repo
}

func New(repo *repository.Repo) *LeaderboardService {
	return &LeaderboardService{repo}
}

func (s *LeaderboardService) GetLeaderboard(ctx context.Context, page, limit int) ([]UserRankResponse, error) {
	start := int64((page - 1) * limit)
	stop := start + int64(limit) - 1

	top, err := s.repo.Leaderboard.GetTop(ctx, start, stop)
	if err != nil {
		return nil, err
	}

	resp := []UserRankResponse{}
	for _, z := range top {
		rank, _ := s.repo.Leaderboard.GetRank(ctx, z.Score)
		resp = append(resp, UserRankResponse{
			Username:   z.Member.(string),
			Rating:     z.Score,
			GlobalRank: rank + 1,
		})
	}
	return resp, nil
}

func (s *LeaderboardService) Search(ctx context.Context, q string) ([]UserRankResponse, error) {
	users, err := s.repo.UserLeaderboard.Search(ctx, q, 20)
	if err != nil {
		return nil, err
	}

	names := []string{}
	for _, u := range users {
		names = append(names, u.Username)
	}

	scores, _ := s.repo.Leaderboard.GetScores(ctx, names)

	resp := []UserRankResponse{}
	for _, u := range users {
		score, ok := scores[u.Username]
		if !ok {
			continue
		}
		rank, _ := s.repo.Leaderboard.GetRank(ctx, score)
		resp = append(resp, UserRankResponse{
			Username:   u.Username,
			Rating:     score,
			GlobalRank: rank + 1,
		})
	}
	return resp, nil
}

func (s *LeaderboardService) SimulateUpdate(ctx context.Context) error {
	user, err := s.repo.UserLeaderboard.Random(ctx)
	log.Default().Printf("User's old rating is %d", user.Rating)
	if err != nil {
		return err
	}

	newRating := rand.Intn(4901) + 100
	_ = s.repo.Leaderboard.UpdateScore(ctx, user.Username, float64(newRating))
	log.Default().Printf("User's new rating is %d", newRating)
	go func(){
		s.repo.UserLeaderboard.UpdateRating(ctx, user.ID, newRating)
	}()
	return nil
}
