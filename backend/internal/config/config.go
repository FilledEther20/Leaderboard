package config

import "os"

type Config struct {
	ReddisAddr     string
	PostgresDSN    string
	LeaderboardKey string
	Port           string
}

func NewConfig() *Config {
	return &Config{
		ReddisAddr:     getEnv("REDIS_ADDR", "localhost:6379"),
		PostgresDSN:    getEnv("POSTGRES_DSN", "host=localhost user=postgres password=postgres dbname=leaderboard port=5432 sslmode=disable"),
		LeaderboardKey: getEnv("LEADERBOARD_KEY", "lb:global"),
		Port:           getEnv("PORT", "8080"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
