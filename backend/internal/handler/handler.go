package handler

import (
	"net/http"
	"strconv"

	"github.com/FilledEther20/Leaderboard/internal/service"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *service.LeaderboardService
}

func New(s *service.LeaderboardService) *Handler {
	return &Handler{s}
}

func (h *Handler) GetLeaderboard(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	resp, err := h.service.GetLeaderboard(c, page, limit)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, resp)
}

func (h *Handler) Search(c *gin.Context) {
	q := c.Query("q")
	if q == "" {
		c.JSON(400, gin.H{"error": "q required"})
		return
	}
	resp,err := h.service.Search(c, q)
	if err!=nil{
		c.JSON(500,gin.H{"error":"Search failed"})
		return 
	}
	c.JSON(200, resp)
}

func (h *Handler) Simulate(c *gin.Context) {
	if err:= h.service.SimulateUpdate(c);err!=nil{
		c.JSON(500,gin.H{"error":"update failed"})
		return 
	}
	c.JSON(200, gin.H{"status": "updated"})
}
