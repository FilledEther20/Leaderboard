package repository

import (
	"context"
	"fmt"

	"github.com/FilledEther20/Leaderboard/internal/config"
	"github.com/redis/go-redis/v9"
)

type RedisClient interface {
	ZRevRangeWithScores(context.Context, string, int64, int64) *redis.ZSliceCmd
	ZScore(context.Context, string, string) *redis.FloatCmd
	ZCount(context.Context, string, string, string) *redis.IntCmd
	ZAdd(context.Context, string, ...redis.Z) *redis.IntCmd
	Pipeline() redis.Pipeliner
}

type LeaderboardRepository interface {
	GetTop(ctx context.Context, start, stop int64) ([]redis.Z, error)
	GetRank(ctx context.Context, score float64) (int64, error)
	UpdateScore(ctx context.Context, username string, score float64) error
	GetScores(ctx context.Context, usernames []string) (map[string]float64, error)
}

type leaderboardRepo struct {
	rdb RedisClient
}

func NewLeaderboardRepo(rdb RedisClient) LeaderboardRepository {
	return &leaderboardRepo{rdb}
}

func (r *leaderboardRepo) GetTop(ctx context.Context, start, stop int64) ([]redis.Z, error) {
	return r.rdb.ZRevRangeWithScores(ctx, config.LeaderboardKey, start, stop).Result()
}

func (r *leaderboardRepo) GetRank(ctx context.Context, score float64) (int64, error) {
	return r.rdb.ZCount(
		ctx,
		config.LeaderboardKey,
		fmt.Sprintf("(%f", score),
		"+inf",
	).Result()
}

func (r *leaderboardRepo) UpdateScore(ctx context.Context, username string, score float64) error {
	return r.rdb.ZAdd(ctx, config.LeaderboardKey, redis.Z{
		Score:  score,
		Member: username,
	}).Err()
}

func (r *leaderboardRepo) GetScores(ctx context.Context, usernames []string) (map[string]float64, error) {
	pipe := r.rdb.Pipeline()
	cmds := map[string]*redis.FloatCmd{}

	for _, u := range usernames {
		cmds[u] = pipe.ZScore(ctx, config.LeaderboardKey, u)
	}
	_, err := pipe.Exec(ctx)
	if err != nil {
		return nil, err
	}

	result := map[string]float64{}
	for u, cmd := range cmds {
		if v, err := cmd.Result(); err == nil {
			result[u] = v
		}
	}
	return result, nil
}
