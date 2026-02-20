package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
	"golang.org/x/crypto/bcrypt"
)

func (h *Handler) GetProfile(c *gin.Context) {
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

	// Try users collection first
	user, err := h.Repo.FindUserByID(ctx, objID)
	if err == nil {
		c.JSON(http.StatusOK, user)
		return
	}

	// If not found in users, try admins collection
	admin, err := h.Repo.FindAdminByID(ctx, objID)
	if err == nil {
		c.JSON(http.StatusOK, admin)
		return
	}

	c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
}

func (h *Handler) UpdateProfile(c *gin.Context) {
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

	var input struct {
		Name            *string `json:"name"`
		Language        *string `json:"language"`
		FavClubID       *string `json:"fav_club_id"`
		ProfileImageURL *string `json:"profile_image_url"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Build update map
	updateFields := bson.M{}

	if input.Name != nil {
		updateFields["name"] = *input.Name
	}
	if input.Language != nil {
		updateFields["language"] = *input.Language
	}
	if input.ProfileImageURL != nil {
		updateFields["profile_image_url"] = *input.ProfileImageURL
	}
	if input.FavClubID != nil {
		clubObjID, err := bson.ObjectIDFromHex(*input.FavClubID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid club ID"})
			return
		}
		updateFields["fav_club_id"] = clubObjID
	}

	if len(updateFields) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No fields to update"})
		return
	}

	// Try updating in users collection first
	err = h.Repo.UpdateUser(ctx, objID, updateFields)
	if err == nil {
		c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully", "collection": "users"})
		return
	}

	// If not found in users, try admins collection
	err = h.Repo.UpdateAdmin(ctx, objID, updateFields)
	if err == nil {
		c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully", "collection": "admins"})
		return
	}

	c.JSON(http.StatusInternalServerError, gin.H{
		"error":        "Update failed",
		"debug":        "User not found in either users or admins collection",
		"objID":        objID.Hex(),
		"updateFields": updateFields,
	})
}

func (h *Handler) UpdatePassword(c *gin.Context) {
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

	var input struct {
		CurrentPassword string `json:"current_password" binding:"required"`
		NewPassword     string `json:"new_password" binding:"required,min=6"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Try to find in users collection first
	var currentPassword string
	var isAdmin bool
	
	user, err := h.Repo.FindUserByID(ctx, objID)
	if err == nil {
		currentPassword = user.Password
		isAdmin = false
	} else {
		// If not found in users, try admins collection
		admin, err := h.Repo.FindAdminByID(ctx, objID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		currentPassword = admin.Password
		isAdmin = true
	}

	// Verify current password
	err = bcrypt.CompareHashAndPassword([]byte(currentPassword), []byte(input.CurrentPassword))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Current password is incorrect"})
		return
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Update password in the correct collection
	updateFields := bson.M{"password": string(hashedPassword)}
	if isAdmin {
		err = h.Repo.UpdateAdmin(ctx, objID, updateFields)
	} else {
		err = h.Repo.UpdateUser(ctx, objID, updateFields)
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
}

func (h *Handler) UpdateFavoriteClub(c *gin.Context) {
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

	var input struct {
		FavClubID string `json:"fav_club_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	clubObjID, err := bson.ObjectIDFromHex(input.FavClubID)
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

	// Update user's favorite club
	updateFields := bson.M{"fav_club_id": clubObjID}
	err = h.Repo.UpdateUser(ctx, objID, updateFields)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update favorite club"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Favorite club updated successfully"})
}

func (h *Handler) UpdateLanguage(c *gin.Context) {
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

	var input struct {
		Language string `json:"language" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate language is supported
	supportedLanguages := []string{"en", "am", "om"}
	isValid := false
	for _, lang := range supportedLanguages {
		if input.Language == lang {
			isValid = true
			break
		}
	}
	if !isValid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unsupported language. Supported: en, am, om"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Update user's language
	updateFields := bson.M{"language": input.Language}
	err = h.Repo.UpdateUser(ctx, objID, updateFields)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update language"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Language updated successfully"})
}
