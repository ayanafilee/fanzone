package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"

	"fanzone/internal/models"
)

// FeedItem represents a unified feed item (news or highlight)
type FeedItem struct {
	ID        string                 `json:"id"`
	Type      string                 `json:"type"` // "news" or "highlight"
	Title     interface{}            `json:"title"`
	Body      interface{}            `json:"body,omitempty"`
	ImageURL  string                 `json:"image_url,omitempty"`
	VideoURL  string                 `json:"video_url,omitempty"`
	Category  string                 `json:"category,omitempty"`
	ClubID    string                 `json:"club_id,omitempty"`
	ClubIDs   []string               `json:"club_ids,omitempty"`
	CreatedAt time.Time              `json:"created_at"`
	Extra     map[string]interface{} `json:"extra,omitempty"`
}

func (h *Handler) GetMyClubFeed(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	objID, err := bson.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Get user's favorite club
	user, err := h.Repo.FindUserByID(ctx, objID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if user.FavClubID.IsZero() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User has no favorite club set"})
		return
	}

	// Fetch news for the user's favorite club
	newsFilter := bson.M{"club_id": user.FavClubID}
	news, err := h.Repo.GetContent(ctx, newsFilter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching news"})
		return
	}

	// Fetch highlights for the user's favorite club
	highlightFilter := bson.M{"club_ids": user.FavClubID}
	highlights, err := h.Repo.GetHighlights(ctx, highlightFilter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching highlights"})
		return
	}

	// Merge and sort by created_at
	feed := mergeFeed(news, highlights)

	c.JSON(http.StatusOK, gin.H{
		"feed":        feed,
		"club_id":     user.FavClubID.Hex(),
		"total_items": len(feed),
	})
}

func (h *Handler) GetAllFeed(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Fetch all news
	news, err := h.Repo.GetContent(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching news"})
		return
	}

	// Fetch all highlights
	highlights, err := h.Repo.GetHighlights(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching highlights"})
		return
	}

	// Merge and sort by created_at
	feed := mergeFeed(news, highlights)

	c.JSON(http.StatusOK, gin.H{
		"feed":        feed,
		"total_items": len(feed),
	})
}

func (h *Handler) GetClubFeed(c *gin.Context) {
	clubID := c.Param("id")
	if clubID == "" {
		clubID = c.Query("club_id")
	}

	if clubID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Club ID is required"})
		return
	}

	clubObjID, err := bson.ObjectIDFromHex(clubID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid club ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Verify club exists
	_, err = h.Repo.FindClubByID(ctx, clubObjID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Club not found"})
		return
	}

	// Fetch news for the specific club
	newsFilter := bson.M{"club_id": clubObjID}
	news, err := h.Repo.GetContent(ctx, newsFilter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching news"})
		return
	}

	// Fetch highlights for the specific club
	highlightFilter := bson.M{"club_ids": clubObjID}
	highlights, err := h.Repo.GetHighlights(ctx, highlightFilter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching highlights"})
		return
	}

	// Merge and sort by created_at
	feed := mergeFeed(news, highlights)

	c.JSON(http.StatusOK, gin.H{
		"feed":        feed,
		"club_id":     clubID,
		"total_items": len(feed),
	})
}

// mergeFeed combines news and highlights into a unified feed sorted by creation time
func mergeFeed(news []models.Content, highlights []models.Highlight) []FeedItem {
	var feed []FeedItem

	// Add news items
	for _, n := range news {
		item := FeedItem{
			ID:        n.ID.Hex(),
			Type:      "news",
			Title:     n.Title,
			Body:      n.Body,
			ImageURL:  n.ImageURL,
			Category:  n.Category,
			CreatedAt: n.CreatedAt,
		}
		if !n.ClubID.IsZero() {
			item.ClubID = n.ClubID.Hex()
		}
		feed = append(feed, item)
	}

	// Add highlight items
	for _, h := range highlights {
		clubIDs := make([]string, len(h.ClubIDs))
		for i, cid := range h.ClubIDs {
			clubIDs[i] = cid.Hex()
		}

		item := FeedItem{
			ID:        h.ID.Hex(),
			Type:      "highlight",
			Title:     h.MatchTitle,
			VideoURL:  h.YoutubeURL,
			ClubIDs:   clubIDs,
			CreatedAt: h.CreatedAt,
		}
		feed = append(feed, item)
	}

	// Sort by CreatedAt DESC (newest first)
	for i := 0; i < len(feed)-1; i++ {
		for j := i + 1; j < len(feed); j++ {
			if feed[i].CreatedAt.Before(feed[j].CreatedAt) {
				feed[i], feed[j] = feed[j], feed[i]
			}
		}
	}

	return feed
}

func (h *Handler) GetLanguages(c *gin.Context) {
	languages := []gin.H{
		{
			"code": "en",
			"name": "English",
		},
		{
			"code": "am",
			"name": "Amharic",
		},
		{
			"code": "om",
			"name": "Oromo",
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"languages": languages,
		"total":     len(languages),
	})
}
