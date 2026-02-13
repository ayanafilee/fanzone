package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

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

type Admin struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Name      string        `bson:"name" json:"name"`
	Email     string        `bson:"email" json:"email"`
	Password  string        `bson:"password" json:"-"`
	Role      string        `bson:"role" json:"role"` // admin or super_admin
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

type MultiLangString struct {
	EN string `bson:"en" json:"en"`
	AM string `bson:"am" json:"am"`
	OM string `bson:"om" json:"om"`
}

type Content struct {
	ID        bson.ObjectID   `bson:"_id,omitempty" json:"id"`
	Title     MultiLangString `bson:"title" json:"title"`
	Body      MultiLangString `bson:"body" json:"body"`
	ImageURL  string          `bson:"image_url" json:"image_url"`
	Category  string          `bson:"category" json:"category"`
	ClubID    bson.ObjectID   `bson:"club_id,omitempty" json:"club_id"`
	CreatedAt time.Time       `bson:"created_at" json:"created_at"`
}

type Highlight struct {
	ID         bson.ObjectID   `bson:"_id,omitempty" json:"id"`
	MatchTitle string          `bson:"match_title" json:"match_title"`
	YoutubeURL string          `bson:"youtube_url" json:"youtube_url"`
	ClubIDs    []bson.ObjectID `bson:"club_ids" json:"club_ids"`
}

type WatchLink struct {
	ID      bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Name    string        `bson:"name" json:"name"`
	URL     string        `bson:"url" json:"url"`
	Type    string        `bson:"type" json:"type"`
	LogoURL string        `bson:"logo_url" json:"logo_url"`
}
