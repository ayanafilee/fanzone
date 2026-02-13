package config

import (
	"os"
)

type Config struct {
	MongoURI      string
	DBName        string
	AccessSecret  []byte
	RefreshSecret []byte
	Port          string
}

func LoadConfig() *Config {
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		mongoURI = "mongodb+srv://ayanafiledugasa:mobileapplicationayu10upme@cluster0.8wl5iqd.mongodb.net/?appName=Cluster0"
	}

	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "ayanafiledugasa"
	}

	accessSecret := os.Getenv("ACCESS_SECRET")
	if accessSecret == "" {
		accessSecret = "short_lived_access_secret_123"
	}

	refreshSecret := os.Getenv("REFRESH_SECRET")
	if refreshSecret == "" {
		refreshSecret = "long_lived_refresh_secret_456"
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
