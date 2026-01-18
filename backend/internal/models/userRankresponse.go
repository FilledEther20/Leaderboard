package models

type UserRankResponse struct {
	Username string `json:"username"`
	Rating int `json:"rating"`
	Rank int `json:"globalRank"`
}
