package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// ==========================================
// CONFIGURATION
// ==========================================

const MONGO_URI = ""
const DB_NAME = ""

// SECURITY: In a real app, these come from os.Getenv()
var ACCESS_SECRET = []byte("short_lived_access_secret_123")  // 15 Minutes
var REFRESH_SECRET = []byte("long_lived_refresh_secret_456") // 7 Days

var client *mongo.Client
var db *mongo.Database

// ==========================================
// MODELS
// ==========================================

type User struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Name      string        `bson:"name" json:"name"`
	Email     string        `bson:"email" json:"email"`
	Password  string        `bson:"password" json:"-"`
	Language  string        `bson:"language" json:"language"`
	FavClubID bson.ObjectID `bson:"fav_club_id,omitempty" json:"fav_club_id"`
	Role      string        `bson:"role" json:"role"`
	CreatedAt time.Time     `bson:"created_at" json:"created_at"`
}

// New Model for storing Refresh Tokens in DB
type RefreshTokenSession struct {
	ID        bson.ObjectID `bson:"_id,omitempty"`
	UserID    bson.ObjectID `bson:"user_id"`
	Token     string        `bson:"token"`
	ExpiresAt time.Time     `bson:"expires_at"`
}

type Club struct {
	ID      bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Name    string        `bson:"name" json:"name"`
	LogoURL string        `bson:"logo_url" json:"logo_url"`
	League  string        `bson:"league" json:"league"`
}

type Content struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Title     string        `bson:"title" json:"title"`
	Body      string        `bson:"body" json:"body"`
	ImageURL  string        `bson:"image_url" json:"image_url"`
	Category  string        `bson:"category" json:"category"`
	ClubID    bson.ObjectID `bson:"club_id,omitempty" json:"club_id"`
	Language  string        `bson:"language" json:"language"`
	CreatedAt time.Time     `bson:"created_at" json:"created_at"`
}

type Highlight struct {
	ID         bson.ObjectID   `bson:"_id,omitempty" json:"id"`
	MatchTitle string          `bson:"match_title" json:"match_title"`
	YoutubeURL string          `bson:"youtube_url" json:"youtube_url"`
	Thumbnail  string          `bson:"thumbnail" json:"thumbnail"`
	ClubIDs    []bson.ObjectID `bson:"club_ids" json:"club_ids"`
	MatchDate  time.Time       `bson:"match_date" json:"match_date"`
}

type WatchLink struct {
	ID      bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Name    string        `bson:"name" json:"name"`
	URL     string        `bson:"url" json:"url"`
	Type    string        `bson:"type" json:"type"`
	LogoURL string        `bson:"logo_url" json:"logo_url"`
}

// ==========================================
// DATABASE CONNECTION
// ==========================================

func connectDB() {
	opts := options.Client().ApplyURI(MONGO_URI)
	
	var err error
	client, err = mongo.Connect(opts)
	if err != nil {
		log.Fatal("Error creating MongoDB client: ", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx, nil); err != nil {
		log.Fatal("Could not ping MongoDB: ", err)
	}

	db = client.Database(DB_NAME)
	fmt.Println("Connected to MongoDB Atlas (Driver v2)!")
}

// ==========================================
// HELPERS (Token Generation)
// ==========================================

func generateAccessToken(userID string, role string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"exp":     time.Now().Add(time.Minute * 15).Unix(), // 15 Minutes
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(ACCESS_SECRET)
}

func generateRefreshToken(userID string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 Days
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(REFRESH_SECRET)
}

// ==========================================
// MIDDLEWARE
// ==========================================

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		tokenString := strings.Replace(authHeader, "Bearer ", "", 1)
		
		// Validate using ACCESS_SECRET
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return ACCESS_SECRET, nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired access token"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if ok {
			c.Set("userID", claims["user_id"])
			c.Set("role", claims["role"])
			c.Next()
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
		}
	}
}

func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists || role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admins only"})
			c.Abort()
			return
		}
		c.Next()
	}
}

// ==========================================
// HANDLERS
// ==========================================

// --- AUTHENTICATION ---

func Register(c *gin.Context) {
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

	var existingUser User
	err := db.Collection("users").FindOne(ctx, bson.M{"email": input.Email}).Decode(&existingUser)
	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already exists"})
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)

	var clubObjID bson.ObjectID
	if input.FavClubID != "" {
		clubObjID, _ = bson.ObjectIDFromHex(input.FavClubID)
	}

	newUser := User{
		ID:        bson.NewObjectID(),
		Name:      input.Name,
		Email:     input.Email,
		Password:  string(hashedPassword),
		Language:  input.Language,
		FavClubID: clubObjID,
		Role:      "user",
		CreatedAt: time.Now(),
	}

	_, err = db.Collection("users").InsertOne(ctx, newUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully"})
}

func Login(c *gin.Context) {
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

	var user User
	err := db.Collection("users").FindOne(ctx, bson.M{"email": input.Email}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// 1. Generate Tokens
	accessToken, _ := generateAccessToken(user.ID.Hex(), user.Role)
	refreshToken, _ := generateRefreshToken(user.ID.Hex())

	// 2. Save Refresh Token to DB
	session := RefreshTokenSession{
		ID:        bson.NewObjectID(),
		UserID:    user.ID,
		Token:     refreshToken,
		ExpiresAt: time.Now().Add(time.Hour * 24 * 7),
	}
	_, err = db.Collection("refresh_tokens").InsertOne(ctx, session)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not save session"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"role":          user.Role,
	})
}

// Get New Access Token using Refresh Token
func RefreshToken(c *gin.Context) {
	var input struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1. Verify Signature of Refresh Token
	token, err := jwt.Parse(input.RefreshToken, func(token *jwt.Token) (interface{}, error) {
		return REFRESH_SECRET, nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
		return
	}

	// 2. Check if this token exists in DB
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var session RefreshTokenSession
	err = db.Collection("refresh_tokens").FindOne(ctx, bson.M{"token": input.RefreshToken}).Decode(&session)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Session revoked or expired"})
		return
	}

	// 3. Check Expiry
	if time.Now().After(session.ExpiresAt) {
		db.Collection("refresh_tokens").DeleteOne(ctx, bson.M{"_id": session.ID}) // Clean up
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Refresh token expired"})
		return
	}

	// 4. Get User Role (Fetch User)
	var user User
	err = db.Collection("users").FindOne(ctx, bson.M{"_id": session.UserID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	// 5. Generate NEW Access Token
	newAccessToken, _ := generateAccessToken(user.ID.Hex(), user.Role)

	c.JSON(http.StatusOK, gin.H{
		"access_token": newAccessToken,
	})
}

func Logout(c *gin.Context) {
	var input struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Remove from DB
	_, err := db.Collection("refresh_tokens").DeleteOne(ctx, bson.M{"token": input.RefreshToken})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Logout failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// --- USER PROFILE ---

func GetProfile(c *gin.Context) {
	userID, _ := c.Get("userID")
	objID, _ := bson.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var user User
	err := db.Collection("users").FindOne(ctx, bson.M{"_id": objID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}

func UpdateProfile(c *gin.Context) {
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

	_, err := db.Collection("users").UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": input})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Update failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Profile updated"})
}

// --- CLUBS ---

func GetClubs(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var clubs []Club
	cursor, err := db.Collection("clubs").Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching clubs"})
		return
	}
	defer cursor.Close(ctx)
	cursor.All(ctx, &clubs)
	c.JSON(http.StatusOK, clubs)
}

// --- CONTENT ---

func GetContent(c *gin.Context) {
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

	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := db.Collection("content").Find(ctx, filter, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching content"})
		return
	}
	defer cursor.Close(ctx)
	
	var contents []Content
	cursor.All(ctx, &contents)
	c.JSON(http.StatusOK, contents)
}

func GetHighlights(c *gin.Context) {
	clubID := c.Query("club_id")
	filter := bson.M{}

	if clubID != "" {
		objID, _ := bson.ObjectIDFromHex(clubID)
		filter["club_ids"] = objID 
	}

	opts := options.Find().SetSort(bson.D{{Key: "match_date", Value: -1}})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := db.Collection("highlights").Find(ctx, filter, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching highlights"})
		return
	}
	defer cursor.Close(ctx)

	var highlights []Highlight
	cursor.All(ctx, &highlights)
	c.JSON(http.StatusOK, highlights)
}

func GetWatchLinks(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var links []WatchLink
	cursor, err := db.Collection("watch_links").Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching links"})
		return
	}
	defer cursor.Close(ctx)
	cursor.All(ctx, &links)
	c.JSON(http.StatusOK, links)
}

// --- ADMIN HANDLERS ---

func AdminAddClub(c *gin.Context) {
	var club Club
	if err := c.ShouldBindJSON(&club); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	club.ID = bson.NewObjectID()
	
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := db.Collection("clubs").InsertOne(ctx, club)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add club"})
		return
	}
	c.JSON(http.StatusCreated, club)
}

func AdminAddContent(c *gin.Context) {
	var content Content
	if err := c.ShouldBindJSON(&content); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	content.ID = bson.NewObjectID()
	content.CreatedAt = time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := db.Collection("content").InsertOne(ctx, content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add content"})
		return
	}
	c.JSON(http.StatusCreated, content)
}

func AdminAddHighlight(c *gin.Context) {
	var highlight Highlight
	if err := c.ShouldBindJSON(&highlight); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	highlight.ID = bson.NewObjectID()
	if highlight.MatchDate.IsZero() {
		highlight.MatchDate = time.Now()
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := db.Collection("highlights").InsertOne(ctx, highlight)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add highlight"})
		return
	}
	c.JSON(http.StatusCreated, highlight)
}

func AdminAddWatchLink(c *gin.Context) {
	var link WatchLink
	if err := c.ShouldBindJSON(&link); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	link.ID = bson.NewObjectID()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := db.Collection("watch_links").InsertOne(ctx, link)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add link"})
		return
	}
	c.JSON(http.StatusCreated, link)
}

func AdminDeleteContent(c *gin.Context) {
	id := c.Param("id")
	objID, _ := bson.ObjectIDFromHex(id)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := db.Collection("content").DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Deleted successfully"})
}

// ==========================================
// MAIN
// ==========================================

func main() {
	connectDB()

	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	auth := r.Group("/api/auth")
	{
		auth.POST("/register", Register)
		auth.POST("/login", Login)
		auth.POST("/refresh", RefreshToken) // New endpoint to get new access token
		auth.POST("/logout", Logout)        // New endpoint to kill session
	}

	api := r.Group("/api")
	{
		api.GET("/clubs", GetClubs)
		api.GET("/content", GetContent)
		api.GET("/highlights", GetHighlights)
		api.GET("/watch-links", GetWatchLinks)
	}

	user := r.Group("/api/user")
	user.Use(AuthMiddleware()) // Checks Access Token
	{
		user.GET("/profile", GetProfile)
		user.PUT("/profile", UpdateProfile)
	}

	admin := r.Group("/api/admin")
	admin.Use(AuthMiddleware())
	admin.Use(AdminMiddleware())
	{
		admin.POST("/clubs", AdminAddClub)
		admin.POST("/content", AdminAddContent)
		admin.DELETE("/content/:id", AdminDeleteContent)
		admin.POST("/highlights", AdminAddHighlight)
		admin.POST("/watch-links", AdminAddWatchLink)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}