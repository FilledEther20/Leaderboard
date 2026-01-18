package router

import (
	"github.com/FilledEther20/Leaderboard/internal/handler"
	"github.com/gin-gonic/gin"
)

func Setup(h *handler.Handler) *gin.Engine {
	r := gin.Default()
	r.GET("/leaderboard", h.GetLeaderboard)
	r.GET("/search", h.Search)
	r.POST("/simulate-update", h.Simulate)
	return r
}
