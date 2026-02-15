package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
	"golang.org/x/crypto/bcrypt"

	"fanzone/internal/auth"
	"fanzone/internal/models"
	"fanzone/pkg/worker"
)

func (h *Handler) Register(c *gin.Context) {
	var input struct {
		Name      string `json:"name" binding:"required"`
		Email     string `json:"email" binding:"required,email"`
		Password  string `json:"password" binding:"required,min=6"`
		Language  string `json:"language"`
		FavClubID string `json:"fav_club_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if h.Repo.EmailExists(ctx, input.Email) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already exists"})
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)

	var clubObjID bson.ObjectID
	if input.FavClubID != "" {
		clubObjID, _ = bson.ObjectIDFromHex(input.FavClubID)
	}

	newUser := models.User{
		ID:        bson.NewObjectID(),
		Name:      input.Name,
		Email:     input.Email,
		Password:  string(hashedPassword),
		Language:  input.Language,
		FavClubID: clubObjID,
		Role:      "user",
		CreatedAt: time.Now(),
	}

	err := h.Repo.CreateUser(ctx, newUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Concurrency: Send Welcome Email in background
	h.Worker.AddTask(worker.Task{
		Type:    "SEND_EMAIL",
		Payload: newUser.Email,
	})

	c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully"})
}

func (h *Handler) RegisterAdmin(c *gin.Context) {
	var input struct {
		Name     string `json:"name" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if h.Repo.EmailExists(ctx, input.Email) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already exists"})
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)

	newAdmin := models.Admin{
		ID:        bson.NewObjectID(),
		Name:      input.Name,
		Email:     input.Email,
		Password:  string(hashedPassword),
		Role:      "admin",
		CreatedAt: time.Now(),
	}

	err := h.Repo.CreateAdmin(ctx, newAdmin)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create admin"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Admin registered successfully"})
}

func (h *Handler) Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var userID bson.ObjectID
	var userRole string
	var userEmail string
	var passwordHash string
	var userName string
	var profileImageURL string
	var language string
	var favClubID bson.ObjectID
	var createdAt time.Time
	var isAdmin bool

	user, err := h.Repo.FindUserByEmail(ctx, input.Email)
	if err == nil {
		userID = user.ID
		userRole = user.Role
		userEmail = user.Email
		passwordHash = user.Password
		userName = user.Name
		profileImageURL = user.ProfileImageURL
		language = user.Language
		favClubID = user.FavClubID
		createdAt = user.CreatedAt
		isAdmin = false
	} else {
		admin, err := h.Repo.FindAdminByEmail(ctx, input.Email)
		if err == nil {
			userID = admin.ID
			userRole = admin.Role
			userEmail = admin.Email
			passwordHash = admin.Password
			userName = admin.Name
			profileImageURL = admin.ProfileImageURL
			createdAt = admin.CreatedAt
			isAdmin = true
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
			return
		}
	}

	err = bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(input.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	accessToken, _ := auth.GenerateAccessToken(userID.Hex(), userRole, h.Config.AccessSecret)
	refreshToken, _ := auth.GenerateRefreshToken(userID.Hex(), h.Config.RefreshSecret)

	session := models.RefreshTokenSession{
		ID:        bson.NewObjectID(),
		UserID:    userID,
		Token:     refreshToken,
		ExpiresAt: time.Now().Add(time.Hour * 24 * 7),
	}
	err = h.Repo.SaveRefreshToken(ctx, session)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not save session"})
		return
	}

	// Concurrency: Log Activity
	h.Worker.AddTask(worker.Task{
		Type:    "LOG_ACTIVITY",
		Payload: "User logged in: " + userEmail,
	})

	response := gin.H{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"user": gin.H{
			"id":                userID.Hex(),
			"name":              userName,
			"email":             userEmail,
			"role":              userRole,
			"profile_image_url": profileImageURL,
			"created_at":        createdAt,
		},
	}

	// Add user-specific fields if not admin
	if !isAdmin {
		response["user"].(gin.H)["language"] = language
		if !favClubID.IsZero() {
			response["user"].(gin.H)["fav_club_id"] = favClubID.Hex()
		}
	}

	c.JSON(http.StatusOK, response)
}

func (h *Handler) RefreshToken(c *gin.Context) {
	var input struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Use Config for secret, but decoding is not strictly needed here if we trust DB lookup,
	// but good practice to verify signature first.
	// We'll skip manual JWT parse here as it's cleaner to reuse middleware logic or just trust DB lookup + expiry
	// For now, let's just do DB lookup which is the source of truth for revocation.

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	session, err := h.Repo.FindRefreshToken(ctx, input.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Session revoked or expired"})
		return
	}

	if time.Now().After(session.ExpiresAt) {
		h.Repo.DeleteRefreshTokenByID(ctx, session.ID)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Refresh token expired"})
		return
	}

	var userRole string
	user, err := h.Repo.FindUserByID(ctx, session.UserID)
	if err == nil {
		userRole = user.Role
	} else {
		admin, err := h.Repo.FindAdminByID(ctx, session.UserID)
		if err == nil {
			userRole = admin.Role
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			return
		}
	}

	newAccessToken, _ := auth.GenerateAccessToken(session.UserID.Hex(), userRole, h.Config.AccessSecret)

	c.JSON(http.StatusOK, gin.H{
		"access_token": newAccessToken,
	})
}

func (h *Handler) Logout(c *gin.Context) {
	var input struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := h.Repo.DeleteRefreshToken(ctx, input.RefreshToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Logout failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}
