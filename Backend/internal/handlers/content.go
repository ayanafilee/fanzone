package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func (h *Handler) GetContent(c *gin.Context) {
	clubID := c.Query("club_id")
	category := c.Query("category")

	filter := bson.M{}
	if clubID != "" {
		objID, _ := bson.ObjectIDFromHex(clubID)
		filter["club_id"] = objID
	}
	if category != "" {
		filter["category"] = category
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	contents, err := h.Repo.GetContent(ctx, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching content"})
		return
	}
	c.JSON(http.StatusOK, contents)
}

func (h *Handler) GetContentByID(c *gin.Context) {
	id := c.Param("id")
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid content ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	content, err := h.Repo.FindContentByID(ctx, objID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Content not found"})
		return
	}
	c.JSON(http.StatusOK, content)
}

func (h *Handler) GetHighlights(c *gin.Context) {
	clubID := c.Query("club_id")
	filter := bson.M{}

	if clubID != "" {
		objID, _ := bson.ObjectIDFromHex(clubID)
		filter["club_ids"] = objID
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	highlights, err := h.Repo.GetHighlights(ctx, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching highlights"})
		return
	}
	c.JSON(http.StatusOK, highlights)
}

func (h *Handler) GetHighlightByID(c *gin.Context) {
	id := c.Param("id")
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid highlight ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	highlight, err := h.Repo.FindHighlightByID(ctx, objID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Highlight not found"})
		return
	}
	c.JSON(http.StatusOK, highlight)
}

func (h *Handler) GetWatchLinks(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	links, err := h.Repo.GetWatchLinks(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching links"})
		return
	}
	c.JSON(http.StatusOK, links)
}

func (h *Handler) GetWatchLinkByID(c *gin.Context) {
	id := c.Param("id")
	objID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid link ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	link, err := h.Repo.FindWatchLinkByID(ctx, objID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Watch link not found"})
		return
	}
	c.JSON(http.StatusOK, link)
}
