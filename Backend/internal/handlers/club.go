package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func (h *Handler) GetClubs(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	clubs, err := h.Repo.GetClubs(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching clubs"})
		return
	}
	c.JSON(http.StatusOK, clubs)
}

func (h *Handler) GetClubByID(c *gin.Context) {
	id := c.Param("id")
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	club, err := h.Repo.FindClubByID(ctx, objID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Club not found"})
		return
	}
	c.JSON(http.StatusOK, club)
}

func (h *Handler) GetClubsByLeague(c *gin.Context) {
	leagueID := c.Param("id")
	leagueObjID, err := bson.ObjectIDFromHex(leagueID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid league ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Verify league exists
	_, err = h.Repo.FindLeagueByID(ctx, leagueObjID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "League not found"})
		return
	}

	// Get all clubs
	allClubs, err := h.Repo.GetClubs(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching clubs"})
		return
	}

	// Filter clubs by league
	var leagueClubs []interface{}
	for _, club := range allClubs {
		if club.LeagueID == leagueObjID {
			leagueClubs = append(leagueClubs, club)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"league_id":   leagueID,
		"clubs":       leagueClubs,
		"total_clubs": len(leagueClubs),
	})
}
