package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"

	"fanzone/internal/models"
)

func (h *Handler) AdminAddClub(c *gin.Context) {
	var club models.Club
	if err := c.ShouldBindJSON(&club); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	club.ID = bson.NewObjectID()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := h.Repo.CreateClub(ctx, club)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add club"})
		return
	}
	c.JSON(http.StatusCreated, club)
}

func (h *Handler) AdminAddContent(c *gin.Context) {
	var input struct {
		Title    models.MultiLangString `json:"title" binding:"required"`
		Body     models.MultiLangString `json:"body" binding:"required"`
		ImageURL string                 `json:"image_url" binding:"required"`
		Category string                 `json:"category" binding:"required"`
		ClubID   string                 `json:"club_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var clubObjID bson.ObjectID
	if input.ClubID != "" {
		clubObjID, _ = bson.ObjectIDFromHex(input.ClubID)
	}

	content := models.Content{
		ID:        bson.NewObjectID(),
		Title:     input.Title,
		Body:      input.Body,
		ImageURL:  input.ImageURL,
		Category:  input.Category,
		ClubID:    clubObjID,
		CreatedAt: time.Now(),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := h.Repo.CreateContent(ctx, content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add content"})
		return
	}
	c.JSON(http.StatusCreated, content)
}

func (h *Handler) AdminUpdateContent(c *gin.Context) {
	id := c.Param("id")
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var input map[string]interface{}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert club_id string to ObjectID if present
	if clubIDStr, ok := input["club_id"].(string); ok && clubIDStr != "" {
		clubObjID, _ := bson.ObjectIDFromHex(clubIDStr)
		input["club_id"] = clubObjID
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = h.Repo.UpdateContent(ctx, objID, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Update failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Content updated successfully"})
}

func (h *Handler) AdminAddHighlight(c *gin.Context) {
	var input struct {
		MatchTitle string   `json:"match_title" binding:"required"`
		YoutubeURL string   `json:"youtube_url" binding:"required"`
		ClubIDs    []string `json:"club_ids" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var clubObjIDs []bson.ObjectID
	for _, idStr := range input.ClubIDs {
		if objID, err := bson.ObjectIDFromHex(idStr); err == nil {
			clubObjIDs = append(clubObjIDs, objID)
		}
	}

	highlight := models.Highlight{
		ID:         bson.NewObjectID(),
		MatchTitle: input.MatchTitle,
		YoutubeURL: input.YoutubeURL,
		ClubIDs:    clubObjIDs,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := h.Repo.CreateHighlight(ctx, highlight)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add highlight"})
		return
	}
	c.JSON(http.StatusCreated, highlight)
}

func (h *Handler) AdminUpdateHighlight(c *gin.Context) {
	id := c.Param("id")
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var input map[string]interface{}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert club_ids strings to ObjectIDs if present
	if ids, ok := input["club_ids"].([]interface{}); ok {
		var clubObjIDs []bson.ObjectID
		for _, idAny := range ids {
			if idStr, ok := idAny.(string); ok {
				if oid, err := bson.ObjectIDFromHex(idStr); err == nil {
					clubObjIDs = append(clubObjIDs, oid)
				}
			}
		}
		input["club_ids"] = clubObjIDs
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = h.Repo.UpdateHighlight(ctx, objID, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Update failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Highlight updated successfully"})
}

func (h *Handler) AdminDeleteHighlight(c *gin.Context) {
	id := c.Param("id")
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = h.Repo.DeleteHighlight(ctx, objID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Delete failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Highlight deleted successfully"})
}

func (h *Handler) AdminAddWatchLink(c *gin.Context) {
	var link models.WatchLink
	if err := c.ShouldBindJSON(&link); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	link.ID = bson.NewObjectID()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := h.Repo.CreateWatchLink(ctx, link)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add link"})
		return
	}
	c.JSON(http.StatusCreated, link)
}

func (h *Handler) AdminUpdateWatchLink(c *gin.Context) {
	id := c.Param("id")
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var input map[string]interface{}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = h.Repo.UpdateWatchLink(ctx, objID, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Update failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Watch link updated successfully"})
}

func (h *Handler) AdminDeleteWatchLink(c *gin.Context) {
	id := c.Param("id")
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = h.Repo.DeleteWatchLink(ctx, objID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Delete failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Watch link deleted successfully"})
}

func (h *Handler) AdminDeleteContent(c *gin.Context) {
	id := c.Param("id")
	objID, _ := bson.ObjectIDFromHex(id)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := h.Repo.DeleteContent(ctx, objID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Deleted successfully"})
}

func (h *Handler) GetStats(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	stats, err := h.Repo.GetCounts(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stats"})
		return
	}

	c.JSON(http.StatusOK, stats)
}

func (h *Handler) GetAllUsers(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	users, err := h.Repo.GetAllUsers(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	c.JSON(http.StatusOK, users)
}

func (h *Handler) GetAllAdmins(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	admins, err := h.Repo.GetAllAdmins(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch admins"})
		return
	}

	c.JSON(http.StatusOK, admins)
}
