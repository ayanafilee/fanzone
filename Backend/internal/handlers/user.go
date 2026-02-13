package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func (h *Handler) GetProfile(c *gin.Context) {
	userID, _ := c.Get("userID")
	objID, _ := bson.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	user, err := h.Repo.FindUserByID(ctx, objID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}

func (h *Handler) UpdateProfile(c *gin.Context) {
	userID, _ := c.Get("userID")
	objID, _ := bson.ObjectIDFromHex(userID.(string))

	var input map[string]interface{}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if clubIDStr, ok := input["fav_club_id"].(string); ok {
		clubObjID, _ := bson.ObjectIDFromHex(clubIDStr)
		input["fav_club_id"] = clubObjID
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := h.Repo.UpdateUser(ctx, objID, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Update failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Profile updated"})
}
