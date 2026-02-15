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

	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware(cfg.AccessSecret))
	{
		api.GET("/clubs", h.GetClubs)
		api.GET("/clubs/:id", h.GetClubByID)
		api.GET("/leagues", h.GetLeagues)
		api.GET("/leagues/:id", h.GetLeagueByID)
		api.GET("/content", h.GetContent)
		api.GET("/content/:id", h.GetContentByID)
		api.GET("/highlights", h.GetHighlights)
		api.GET("/highlights/:id", h.GetHighlightByID)
		api.GET("/watch-links", h.GetWatchLinks)
		api.GET("/watch-links/:id", h.GetWatchLinkByID)
	}

	userGroup := r.Group("/api/user")
	userGroup.Use(middleware.AuthMiddleware(cfg.AccessSecret))
	{
		userGroup.GET("/profile", h.GetProfile)
		userGroup.PUT("/profile", h.UpdateProfile)
		userGroup.PUT("/password", h.UpdatePassword)
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
