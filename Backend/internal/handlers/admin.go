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
	var input struct {
		Name     string `json:"name" binding:"required"`
		LogoURL  string `json:"logo_url" binding:"required"`
		LeagueID string `json:"league_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	leagueObjID, err := bson.ObjectIDFromHex(input.LeagueID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid League ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Check if league exists
	_, err = h.Repo.FindLeagueByID(ctx, leagueObjID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "League does not exist"})
		return
	}

	club := models.Club{
		ID:       bson.NewObjectID(),
		Name:     input.Name,
		LogoURL:  input.LogoURL,
		LeagueID: leagueObjID,
	}

	err = h.Repo.CreateClub(ctx, club)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add club"})
		return
	}

	h.logActivity(c, "Added Club", "club", club.Name)
	c.JSON(http.StatusCreated, club)
}

func (h *Handler) AdminUpdateClub(c *gin.Context) {
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

	if leagueIDStr, ok := input["league_id"].(string); ok && leagueIDStr != "" {
		leagueObjID, err := bson.ObjectIDFromHex(leagueIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid League ID"})
			return
		}
		input["league_id"] = leagueObjID
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = h.Repo.UpdateClub(ctx, objID, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Update failed"})
		return
	}

	h.logActivity(c, "Updated Club", "club", id)
	c.JSON(http.StatusOK, gin.H{"message": "Club updated successfully"})
}

func (h *Handler) AdminDeleteClub(c *gin.Context) {
	id := c.Param("id")
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = h.Repo.DeleteClub(ctx, objID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Delete failed"})
		return
	}

	h.logActivity(c, "Deleted Club", "club", id)
	c.JSON(http.StatusOK, gin.H{"message": "Club deleted successfully"})
}

func (h *Handler) AdminAddLeague(c *gin.Context) {
	var league models.League
	if err := c.ShouldBindJSON(&league); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	league.ID = bson.NewObjectID()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := h.Repo.CreateLeague(ctx, league)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add league"})
		return
	}

	h.logActivity(c, "Added League", "league", league.Name)
	c.JSON(http.StatusCreated, league)
}

func (h *Handler) AdminUpdateLeague(c *gin.Context) {
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

	err = h.Repo.UpdateLeague(ctx, objID, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Update failed"})
		return
	}

	h.logActivity(c, "Updated League", "league", id)
	c.JSON(http.StatusOK, gin.H{"message": "League updated successfully"})
}

func (h *Handler) AdminDeleteLeague(c *gin.Context) {
	id := c.Param("id")
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = h.Repo.DeleteLeague(ctx, objID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Delete failed"})
		return
	}

	h.logActivity(c, "Deleted League", "league", id)
	c.JSON(http.StatusOK, gin.H{"message": "League deleted successfully"})
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

	h.logActivity(c, "Added Content", "content", content.ID.Hex())
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

	h.logActivity(c, "Updated Content", "content", id)
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
		CreatedAt:  time.Now(),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := h.Repo.CreateHighlight(ctx, highlight)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add highlight"})
		return
	}

	h.logActivity(c, "Added Highlight", "highlight", highlight.MatchTitle)
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

	h.logActivity(c, "Updated Highlight", "highlight", id)
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

	h.logActivity(c, "Deleted Highlight", "highlight", id)
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

	h.logActivity(c, "Added Watch Link", "watch_link", link.Name)
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

	h.logActivity(c, "Updated Watch Link", "watch_link", id)
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

	h.logActivity(c, "Deleted Watch Link", "watch_link", id)
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

	h.logActivity(c, "Deleted Content", "content", id)
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

func (h *Handler) GetAnalytics(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	growth, _ := h.Repo.GetUserGrowth(ctx)
	popularity, _ := h.Repo.GetClubPopularity(ctx)
	languages, _ := h.Repo.GetLanguageDistribution(ctx)

	c.JSON(http.StatusOK, gin.H{
		"user_growth":     growth,
		"club_popularity": popularity,
		"languages":       languages,
	})
}

func (h *Handler) GetActivityFeed(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	activities, err := h.Repo.GetRecentActivities(ctx, 20)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch activities"})
		return
	}

	c.JSON(http.StatusOK, activities)
}

func (h *Handler) logActivity(c *gin.Context, action, entity, detail string) {
	userIDStr, ok := c.Get("userID")
	if !ok {
		return
	}

	userID, err := bson.ObjectIDFromHex(userIDStr.(string))
	if err != nil {
		return
	}

	activity := models.Activity{
		ID:        bson.NewObjectID(),
		UserID:    userID,
		Action:    action,
		Entity:    entity,
		Detail:    detail,
		Timestamp: time.Now(),
	}

	_ = h.Repo.LogActivity(context.Background(), activity)
}
