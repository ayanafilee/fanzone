package handlers

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"

	"fanzone/internal/models"
)

// AddReaction adds or updates a reaction count for content (anonymous)
func (h *Handler) AddReaction(c *gin.Context) {
	var input struct {
		ContentType  string `json:"content_type" binding:"required"`
		ContentID    string `json:"content_id" binding:"required"`
		ReactionType string `json:"reaction_type" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("❌ [REACTION ERROR] Invalid input: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid input: " + err.Error(),
			"required_fields": map[string]string{
				"content_type":  "string (required) - Must be 'news' or 'highlight'",
				"content_id":    "string (required) - ID of the content",
				"reaction_type": "string (required) - Must be: like, love, wow, sad, or angry",
			},
			"example": map[string]string{
				"content_type":  "news",
				"content_id":    "507f1f77bcf86cd799439012",
				"reaction_type": "like",
			},
		})
		return
	}

	log.Printf("📥 [REACTION] Received input: content_type=%s, content_id=%s, reaction_type=%s", 
		input.ContentType, input.ContentID, input.ReactionType)

	// Validate content type
	if input.ContentType != "news" && input.ContentType != "highlight" {
		log.Printf("❌ [REACTION ERROR] Invalid content type: %s", input.ContentType)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid content type. Must be 'news' or 'highlight'"})
		return
	}

	// Validate reaction type
	validReactions := []string{"like", "love", "wow", "sad", "angry"}
	isValid := false
	for _, r := range validReactions {
		if input.ReactionType == r {
			isValid = true
			break
		}
	}
	if !isValid {
		log.Printf("❌ [REACTION ERROR] Invalid reaction type: %s", input.ReactionType)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid reaction type. Must be: like, love, wow, sad, or angry"})
		return
	}

	contentObjID, err := bson.ObjectIDFromHex(input.ContentID)
	if err != nil {
		log.Printf("❌ [REACTION ERROR] Invalid content ID format: %s", input.ContentID)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid content ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	log.Printf("👍 [REACTION] Adding %s reaction to %s %s", input.ReactionType, input.ContentType, input.ContentID)

	// Simply increment the reaction count
	if input.ContentType == "news" {
		err = h.Repo.UpdateContentReactionCount(ctx, contentObjID, input.ReactionType, 1)
	} else {
		err = h.Repo.UpdateHighlightReactionCount(ctx, contentObjID, input.ReactionType, 1)
	}

	if err != nil {
		log.Printf("❌ [REACTION ERROR] Failed to update reaction count: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add reaction"})
		return
	}

	log.Printf("✅ [REACTION] Reaction count updated successfully")

	// Get updated counts
	counts, err := h.Repo.GetReactionCounts(ctx, contentObjID, input.ContentType)
	if err != nil {
		log.Printf("⚠️  [REACTION] Failed to get updated counts: %v", err)
		counts = models.ReactionCounts{}
	}

	log.Printf("📊 [REACTION] Updated counts: %+v", counts)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Reaction added",
		"reaction": gin.H{
			"content_type":  input.ContentType,
			"content_id":    input.ContentID,
			"reaction_type": input.ReactionType,
		},
		"counts": counts,
	})
}

// GetReactionCounts gets reaction counts for content (public endpoint)
func (h *Handler) GetReactionCounts(c *gin.Context) {
	contentType := c.Param("content_type")
	contentID := c.Param("content_id")

	contentObjID, err := bson.ObjectIDFromHex(contentID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid content ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	log.Printf("📊 [REACTION] Getting counts for %s %s", contentType, contentID)

	counts, err := h.Repo.GetReactionCounts(ctx, contentObjID, contentType)
	if err != nil {
		log.Printf("❌ [REACTION ERROR] Content not found: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Content not found"})
		return
	}

	log.Printf("✅ [REACTION] Counts retrieved: %+v", counts)

	c.JSON(http.StatusOK, counts)
}
