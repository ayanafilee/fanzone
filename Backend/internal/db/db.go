package db

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func ConnectDB(uri string, dbName string) (*mongo.Client, *mongo.Database) {
	opts := options.Client().ApplyURI(uri)

	client, err := mongo.Connect(opts)
	if err != nil {
		log.Fatal("Error creating MongoDB client: ", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx, nil); err != nil {
		log.Fatal("Could not ping MongoDB: ", err)
	}

	db := client.Database(dbName)
	fmt.Println("Connected to MongoDB Atlas (Driver v2)!")

	return client, db
}
