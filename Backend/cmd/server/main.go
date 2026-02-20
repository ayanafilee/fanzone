package main

import (
	"log"

	"github.com/gin-gonic/gin"

	"fanzone/internal/config"
	"fanzone/internal/db"
	"fanzone/internal/handlers"
	"fanzone/internal/middleware"
	"fanzone/internal/repository"
	"fanzone/pkg/worker"
)

func main() {
	// 1. Load Configuration
	cfg := config.LoadConfig()

	// 2. Connect to Database
	_, database := db.ConnectDB(cfg.MongoURI, cfg.DBName)
	// Ideally, handle client disconnect on shutdown

	// 3. Initialize Repository
	repo := repository.NewRepository(database)

	// 4. Initialize Background Worker
	//    Buffer size 100, 3 workers
	w := worker.NewWorker(100)
	w.Start(3)
	defer w.Stop()

	// 5. Initialize Handlers
	h := handlers.NewHandler(repo, cfg, w)

	// 6. Setup Router
	r := gin.Default()

	// CORS Middleware
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

	authGroup := r.Group("/api/auth")
	{
		authGroup.POST("/register", h.Register)
		authGroup.POST("/login", h.Login)
		authGroup.POST("/refresh", h.RefreshToken)
		authGroup.POST("/logout", h.Logout)
	}

	// Public endpoints (no authentication required for mobile users)
	publicGroup := r.Group("/api")
	{
		// Clubs
		publicGroup.GET("/clubs", h.GetClubs)
		publicGroup.GET("/clubs/:id", h.GetClubByID)
		
		// Leagues
		publicGroup.GET("/leagues", h.GetLeagues)
		publicGroup.GET("/leagues/:id", h.GetLeagueByID)
		
		// Languages
		publicGroup.GET("/languages", h.GetLanguages)
		
		// Content/News
		publicGroup.GET("/content", h.GetContent)
		publicGroup.GET("/content/:id", h.GetContentByID)
		publicGroup.GET("/news/:id", h.GetContentByID) // Alias for content
		
		// Highlights
		publicGroup.GET("/highlights", h.GetHighlights)
		publicGroup.GET("/highlights/:id", h.GetHighlightByID)
		
		// Watch Platforms
		publicGroup.GET("/watch-links", h.GetWatchLinks)
		publicGroup.GET("/watch-platforms", h.GetWatchLinks) // Alias for watch-links
		publicGroup.GET("/watch-links/:id", h.GetWatchLinkByID)
		
		// Feed endpoints (public - no authentication needed)
		publicGroup.GET("/feed/all", h.GetAllFeed)
		publicGroup.GET("/feed/club/:id", h.GetClubFeed)
	}

	// Protected API endpoints (require authentication - for web dashboard)
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware(cfg.AccessSecret))
	{
		// Feed endpoint that requires user authentication
		api.GET("/feed/my-club", h.GetMyClubFeed)
	}

	userGroup := r.Group("/api/users")
	userGroup.Use(middleware.AuthMiddleware(cfg.AccessSecret))
	{
		userGroup.GET("/me", h.GetProfile)
		userGroup.PUT("/me", h.UpdateProfile)
		userGroup.PATCH("/me/favorite-club", h.UpdateFavoriteClub)
		userGroup.PATCH("/me/language", h.UpdateLanguage)
	}

	// Legacy user routes for backward compatibility
	legacyUserGroup := r.Group("/api/user")
	legacyUserGroup.Use(middleware.AuthMiddleware(cfg.AccessSecret))
	{
		legacyUserGroup.GET("/profile", h.GetProfile)
		legacyUserGroup.PUT("/profile", h.UpdateProfile)
		legacyUserGroup.PUT("/password", h.UpdatePassword)
	}

	adminGroup := r.Group("/api/admin")
	adminGroup.Use(middleware.AuthMiddleware(cfg.AccessSecret))
	adminGroup.Use(middleware.AdminMiddleware()) // Allows both 'admin' and 'super_admin'
	{
		adminGroup.POST("/clubs", h.AdminAddClub)
		adminGroup.PUT("/clubs/:id", h.AdminUpdateClub)
		adminGroup.DELETE("/clubs/:id", h.AdminDeleteClub)
		adminGroup.POST("/leagues", h.AdminAddLeague)
		adminGroup.PUT("/leagues/:id", h.AdminUpdateLeague)
		adminGroup.DELETE("/leagues/:id", h.AdminDeleteLeague)
		adminGroup.POST("/content", h.AdminAddContent)
		adminGroup.PUT("/content/:id", h.AdminUpdateContent)
		adminGroup.DELETE("/content/:id", h.AdminDeleteContent)
		adminGroup.POST("/highlights", h.AdminAddHighlight)
		adminGroup.PUT("/highlights/:id", h.AdminUpdateHighlight)
		adminGroup.DELETE("/highlights/:id", h.AdminDeleteHighlight)
		adminGroup.POST("/watch-links", h.AdminAddWatchLink)
		adminGroup.PUT("/watch-links/:id", h.AdminUpdateWatchLink)
		adminGroup.DELETE("/watch-links/:id", h.AdminDeleteWatchLink)
		adminGroup.GET("/stats", h.GetStats)
		adminGroup.GET("/analytics", h.GetAnalytics)
		adminGroup.GET("/activities", h.GetActivityFeed)
		adminGroup.GET("/users", h.GetAllUsers)
	}

	superAdminGroup := r.Group("/api/super-admin")
	superAdminGroup.Use(middleware.AuthMiddleware(cfg.AccessSecret))
	superAdminGroup.Use(middleware.SuperAdminMiddleware()) // Only 'super_admin'
	{
		superAdminGroup.POST("/register-admin", h.RegisterAdmin)
		superAdminGroup.GET("/admins", h.GetAllAdmins)
	}

	// 7. Start Server
	log.Printf("Server starting on port %s", cfg.Port)
	r.Run(":" + cfg.Port)
}
