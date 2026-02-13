package repository

import (
	"context"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"fanzone/internal/models"
)

type Repository struct {
	DB *mongo.Database
}

func NewRepository(db *mongo.Database) *Repository {
	return &Repository{DB: db}
}

// --- User (Mobile) ---

func (r *Repository) CreateUser(ctx context.Context, user models.User) error {
	_, err := r.DB.Collection("users").InsertOne(ctx, user)
	return err
}

func (r *Repository) FindUserByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	err := r.DB.Collection("users").FindOne(ctx, bson.M{"email": email}).Decode(&user)
	return &user, err
}

func (r *Repository) FindUserByID(ctx context.Context, id bson.ObjectID) (*models.User, error) {
	var user models.User
	err := r.DB.Collection("users").FindOne(ctx, bson.M{"_id": id}).Decode(&user)
	return &user, err
}

func (r *Repository) UpdateUser(ctx context.Context, id bson.ObjectID, update bson.M) error {
	_, err := r.DB.Collection("users").UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": update})
	return err
}

func (r *Repository) GetAllUsers(ctx context.Context) ([]models.User, error) {
	var users []models.User
	cursor, err := r.DB.Collection("users").Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	err = cursor.All(ctx, &users)
	return users, err
}

// --- Admin ---

func (r *Repository) CreateAdmin(ctx context.Context, admin models.Admin) error {
	_, err := r.DB.Collection("admins").InsertOne(ctx, admin)
	return err
}

func (r *Repository) FindAdminByEmail(ctx context.Context, email string) (*models.Admin, error) {
	var admin models.Admin
	err := r.DB.Collection("admins").FindOne(ctx, bson.M{"email": email}).Decode(&admin)
	return &admin, err
}

func (r *Repository) FindAdminByID(ctx context.Context, id bson.ObjectID) (*models.Admin, error) {
	var admin models.Admin
	err := r.DB.Collection("admins").FindOne(ctx, bson.M{"_id": id}).Decode(&admin)
	return &admin, err
}

func (r *Repository) GetAllAdmins(ctx context.Context) ([]models.Admin, error) {
	var admins []models.Admin
	cursor, err := r.DB.Collection("admins").Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	err = cursor.All(ctx, &admins)
	return admins, err
}

func (r *Repository) EmailExists(ctx context.Context, email string) bool {
	count, _ := r.DB.Collection("users").CountDocuments(ctx, bson.M{"email": email})
	if count > 0 {
		return true
	}
	count, _ = r.DB.Collection("admins").CountDocuments(ctx, bson.M{"email": email})
	return count > 0
}

// --- Refresh Token ---

func (r *Repository) SaveRefreshToken(ctx context.Context, session models.RefreshTokenSession) error {
	_, err := r.DB.Collection("refresh_tokens").InsertOne(ctx, session)
	return err
}

func (r *Repository) FindRefreshToken(ctx context.Context, token string) (*models.RefreshTokenSession, error) {
	var session models.RefreshTokenSession
	err := r.DB.Collection("refresh_tokens").FindOne(ctx, bson.M{"token": token}).Decode(&session)
	return &session, err
}

func (r *Repository) DeleteRefreshToken(ctx context.Context, token string) error {
	_, err := r.DB.Collection("refresh_tokens").DeleteOne(ctx, bson.M{"token": token})
	return err
}

func (r *Repository) DeleteRefreshTokenByID(ctx context.Context, id bson.ObjectID) error {
	_, err := r.DB.Collection("refresh_tokens").DeleteOne(ctx, bson.M{"_id": id})
	return err
}

// --- Club ---

func (r *Repository) GetClubs(ctx context.Context) ([]models.Club, error) {
	var clubs []models.Club
	cursor, err := r.DB.Collection("clubs").Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	err = cursor.All(ctx, &clubs)
	return clubs, err
}

func (r *Repository) CreateClub(ctx context.Context, club models.Club) error {
	_, err := r.DB.Collection("clubs").InsertOne(ctx, club)
	return err
}

// --- Content ---

func (r *Repository) GetContent(ctx context.Context, filter bson.M) ([]models.Content, error) {
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, err := r.DB.Collection("content").Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var contents []models.Content
	err = cursor.All(ctx, &contents)
	return contents, err
}

func (r *Repository) CreateContent(ctx context.Context, content models.Content) error {
	_, err := r.DB.Collection("content").InsertOne(ctx, content)
	return err
}

func (r *Repository) FindContentByID(ctx context.Context, id bson.ObjectID) (*models.Content, error) {
	var content models.Content
	err := r.DB.Collection("content").FindOne(ctx, bson.M{"_id": id}).Decode(&content)
	return &content, err
}

func (r *Repository) UpdateContent(ctx context.Context, id bson.ObjectID, update bson.M) error {
	_, err := r.DB.Collection("content").UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": update})
	return err
}

func (r *Repository) DeleteContent(ctx context.Context, id bson.ObjectID) error {
	_, err := r.DB.Collection("content").DeleteOne(ctx, bson.M{"_id": id})
	return err
}

// --- Highlight ---

func (r *Repository) GetHighlights(ctx context.Context, filter bson.M) ([]models.Highlight, error) {
	opts := options.Find().SetSort(bson.D{{Key: "_id", Value: -1}})
	cursor, err := r.DB.Collection("highlights").Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var highlights []models.Highlight
	err = cursor.All(ctx, &highlights)
	return highlights, err
}

func (r *Repository) CreateHighlight(ctx context.Context, highlight models.Highlight) error {
	_, err := r.DB.Collection("highlights").InsertOne(ctx, highlight)
	return err
}

func (r *Repository) FindHighlightByID(ctx context.Context, id bson.ObjectID) (*models.Highlight, error) {
	var highlight models.Highlight
	err := r.DB.Collection("highlights").FindOne(ctx, bson.M{"_id": id}).Decode(&highlight)
	return &highlight, err
}

func (r *Repository) UpdateHighlight(ctx context.Context, id bson.ObjectID, update bson.M) error {
	_, err := r.DB.Collection("highlights").UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": update})
	return err
}

func (r *Repository) DeleteHighlight(ctx context.Context, id bson.ObjectID) error {
	_, err := r.DB.Collection("highlights").DeleteOne(ctx, bson.M{"_id": id})
	return err
}

// --- WatchLink ---

func (r *Repository) GetWatchLinks(ctx context.Context) ([]models.WatchLink, error) {
	var links []models.WatchLink
	cursor, err := r.DB.Collection("watch_links").Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	err = cursor.All(ctx, &links)
	return links, err
}

func (r *Repository) CreateWatchLink(ctx context.Context, link models.WatchLink) error {
	_, err := r.DB.Collection("watch_links").InsertOne(ctx, link)
	return err
}

func (r *Repository) FindWatchLinkByID(ctx context.Context, id bson.ObjectID) (*models.WatchLink, error) {
	var link models.WatchLink
	err := r.DB.Collection("watch_links").FindOne(ctx, bson.M{"_id": id}).Decode(&link)
	return &link, err
}

func (r *Repository) UpdateWatchLink(ctx context.Context, id bson.ObjectID, update bson.M) error {
	_, err := r.DB.Collection("watch_links").UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": update})
	return err
}

func (r *Repository) DeleteWatchLink(ctx context.Context, id bson.ObjectID) error {
	_, err := r.DB.Collection("watch_links").DeleteOne(ctx, bson.M{"_id": id})
	return err
}

func (r *Repository) GetCounts(ctx context.Context) (map[string]int64, error) {
	counts := make(map[string]int64)

	userCount, err := r.DB.Collection("users").CountDocuments(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	counts["users"] = userCount

	adminCount, err := r.DB.Collection("admins").CountDocuments(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	counts["admins"] = adminCount

	contentCount, err := r.DB.Collection("content").CountDocuments(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	counts["content"] = contentCount

	highlightCount, err := r.DB.Collection("highlights").CountDocuments(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	counts["highlights"] = highlightCount

	watchLinkCount, err := r.DB.Collection("watch_links").CountDocuments(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	counts["watch_links"] = watchLinkCount

	return counts, nil
}
