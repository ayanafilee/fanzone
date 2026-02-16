package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	MongoURI      string
	DBName        string
	AccessSecret  []byte
	RefreshSecret []byte
	Port          string
}

func LoadConfig() *Config {
	// Load .env.local if it exists
	if err := godotenv.Load(".env.local"); err != nil {
		log.Println("No .env.local file found, falling back to system environment variables")
	}

	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		log.Fatal("MONGO_URI is not set in environment")
	}

	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "ayanafiledugasa" // Default if not critical
	}

	accessSecret := os.Getenv("ACCESS_SECRET")
	if accessSecret == "" {
		log.Fatal("ACCESS_SECRET is not set in environment")
	}

	refreshSecret := os.Getenv("REFRESH_SECRET")
	if refreshSecret == "" {
		log.Fatal("REFRESH_SECRET is not set in environment")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	return &Config{
		MongoURI:      mongoURI,
		DBName:        dbName,
		AccessSecret:  []byte(accessSecret),
		RefreshSecret: []byte(refreshSecret),
		Port:          port,
	}
}
