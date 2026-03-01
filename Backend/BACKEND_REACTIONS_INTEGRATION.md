# Backend Reactions Integration Guide

## Problem

The mobile app can add reactions (backend processes them), but reactions don't show on content/highlights because the backend isn't returning reaction data in the feed responses.

## Solution

The backend needs to include reaction counts and user's reaction in ALL content/highlight responses.

## Required Backend Changes

### 1. Update Content/News Response Format

**Current Response (Missing Reactions):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": {
    "en": "Big Win Today",
    "am": "ዛሬ ትልቅ ድል",
    "om": "Injifannoo Guddaa Har'a"
  },
  "body": {
    "en": "The team won 3-0...",
    "am": "ቡድኑ በ3-0 አሸንፏል...",
    "om": "Gareen 3-0 injifate..."
  },
  "image_url": "https://example.com/news.jpg",
  "category": "match_report",
  "club_id": "507f1f77bcf86cd799439012",
  "created_at": "2024-01-15T10:00:00Z"
}
```

**Required Response (With Reactions):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": {
    "en": "Big Win Today",
    "am": "ዛሬ ትልቅ ድል",
    "om": "Injifannoo Guddaa Har'a"
  },
  "body": {
    "en": "The team won 3-0...",
    "am": "ቡድኑ በ3-0 አሸንፏል...",
    "om": "Gareen 3-0 injifate..."
  },
  "image_url": "https://example.com/news.jpg",
  "category": "match_report",
  "club_id": "507f1f77bcf86cd799439012",
  "created_at": "2024-01-15T10:00:00Z",
  "reactions": {
    "like": 45,
    "love": 23,
    "wow": 12,
    "sad": 3,
    "angry": 1
  },
  "user_reaction": "like"
}
```

### 2. Update Highlight Response Format

**Current Response (Missing Reactions):**
```json
{
  "id": "507f1f77bcf86cd799439014",
  "match_title": "Arsenal vs Chelsea - Full Highlights",
  "youtube_url": "https://youtube.com/watch?v=abc123",
  "club_ids": [
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439015"
  ],
  "created_at": "2024-01-15T20:00:00Z"
}
```

**Required Response (With Reactions):**
```json
{
  "id": "507f1f77bcf86cd799439014",
  "match_title": "Arsenal vs Chelsea - Full Highlights",
  "youtube_url": "https://youtube.com/watch?v=abc123",
  "club_ids": [
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439015"
  ],
  "created_at": "2024-01-15T20:00:00Z",
  "reactions": {
    "like": 30,
    "love": 15,
    "wow": 8,
    "sad": 2,
    "angry": 0
  },
  "user_reaction": "love"
}
```

## Endpoints That Need Updates

### 1. GET /api/content
**Returns:** List of news articles
**Add:** `reactions` and `user_reaction` to each item

### 2. GET /api/content/:id
**Returns:** Single news article
**Add:** `reactions` and `user_reaction`

### 3. GET /api/highlights
**Returns:** List of highlights
**Add:** `reactions` and `user_reaction` to each item

### 4. GET /api/highlights/:id
**Returns:** Single highlight
**Add:** `reactions` and `user_reaction`

### 5. GET /api/feed/all
**Returns:** Mixed feed of news and highlights
**Add:** `reactions` and `user_reaction` to each item

## Backend Implementation Steps

### Step 1: Add Reactions Field to Models

**Content/News Model:**
```go
type Content struct {
    ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    Title     map[string]string  `bson:"title" json:"title"`
    Body      map[string]string  `bson:"body" json:"body"`
    ImageURL  string             `bson:"image_url" json:"image_url"`
    Category  string             `bson:"category" json:"category"`
    ClubID    string             `bson:"club_id" json:"club_id"`
    CreatedAt time.Time          `bson:"created_at" json:"created_at"`
    
    // ADD THESE FIELDS
    Reactions ReactionCounts     `bson:"reactions" json:"reactions"`
}

type ReactionCounts struct {
    Like  int `bson:"like" json:"like"`
    Love  int `bson:"love" json:"love"`
    Wow   int `bson:"wow" json:"wow"`
    Sad   int `bson:"sad" json:"sad"`
    Angry int `bson:"angry" json:"angry"`
}
```

**Highlight Model:**
```go
type Highlight struct {
    ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    MatchTitle string             `bson:"match_title" json:"match_title"`
    YoutubeURL string             `bson:"youtube_url" json:"youtube_url"`
    ClubIDs    []string           `bson:"club_ids" json:"club_ids"`
    CreatedAt  time.Time          `bson:"created_at" json:"created_at"`
    
    // ADD THESE FIELDS
    Reactions ReactionCounts     `bson:"reactions" json:"reactions"`
}
```

### Step 2: Initialize Reactions Field

When creating new content/highlights, initialize reactions to zero:

```go
content := Content{
    // ... other fields
    Reactions: ReactionCounts{
        Like:  0,
        Love:  0,
        Wow:   0,
        Sad:   0,
        Angry: 0,
    },
}
```

### Step 3: Update Existing Data (Migration)

Run this migration to add reactions field to existing content:

```javascript
// MongoDB migration script
db.content.updateMany(
  { reactions: { $exists: false } },
  {
    $set: {
      reactions: {
        like: 0,
        love: 0,
        wow: 0,
        sad: 0,
        angry: 0
      }
    }
  }
);

db.highlights.updateMany(
  { reactions: { $exists: false } },
  {
    $set: {
      reactions: {
        like: 0,
        love: 0,
        wow: 0,
        sad: 0,
        angry: 0
      }
    }
  }
);
```

### Step 4: Add Helper Function to Get User's Reaction

```go
func getUserReaction(userID, contentType, contentID string) string {
    var reaction Reaction
    filter := bson.M{
        "user_id":      userID,
        "content_type": contentType,
        "content_id":   contentID,
    }
    
    err := reactionsCollection.FindOne(context.Background(), filter).Decode(&reaction)
    if err != nil {
        return "" // No reaction
    }
    
    return reaction.ReactionType // "like", "love", etc.
}
```

### Step 5: Update GET /api/content Endpoint

```go
func GetAllContent(c *gin.Context) {
    userID := c.Query("user_id") // Optional: get from query param
    
    var contents []Content
    cursor, err := contentCollection.Find(context.Background(), bson.M{})
    if err != nil {
        c.JSON(500, gin.H{"error": "Error fetching content"})
        return
    }
    defer cursor.Close(context.Background())
    
    if err = cursor.All(context.Background(), &contents); err != nil {
        c.JSON(500, gin.H{"error": "Error decoding content"})
        return
    }
    
    // Add user_reaction to each content
    response := make([]map[string]interface{}, len(contents))
    for i, content := range contents {
        contentMap := map[string]interface{}{
            "id":         content.ID.Hex(),
            "title":      content.Title,
            "body":       content.Body,
            "image_url":  content.ImageURL,
            "category":   content.Category,
            "club_id":    content.ClubID,
            "created_at": content.CreatedAt,
            "reactions":  content.Reactions,
        }
        
        // Add user's reaction if user_id provided
        if userID != "" {
            userReaction := getUserReaction(userID, "news", content.ID.Hex())
            if userReaction != "" {
                contentMap["user_reaction"] = userReaction
            }
        }
        
        response[i] = contentMap
    }
    
    c.JSON(200, response)
}
```

### Step 6: Update GET /api/content/:id Endpoint

```go
func GetContentByID(c *gin.Context) {
    id := c.Param("id")
    userID := c.Query("user_id") // Optional
    
    objectID, err := primitive.ObjectIDFromHex(id)
    if err != nil {
        c.JSON(400, gin.H{"error": "Invalid content ID"})
        return
    }
    
    var content Content
    err = contentCollection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&content)
    if err != nil {
        c.JSON(404, gin.H{"error": "Content not found"})
        return
    }
    
    response := map[string]interface{}{
        "id":         content.ID.Hex(),
        "title":      content.Title,
        "body":       content.Body,
        "image_url":  content.ImageURL,
        "category":   content.Category,
        "club_id":    content.ClubID,
        "created_at": content.CreatedAt,
        "reactions":  content.Reactions,
    }
    
    // Add user's reaction if user_id provided
    if userID != "" {
        userReaction := getUserReaction(userID, "news", content.ID.Hex())
        if userReaction != "" {
            response["user_reaction"] = userReaction
        }
    }
    
    c.JSON(200, response)
}
```

### Step 7: Update GET /api/highlights Endpoint

```go
func GetAllHighlights(c *gin.Context) {
    userID := c.Query("user_id") // Optional
    
    var highlights []Highlight
    cursor, err := highlightsCollection.Find(context.Background(), bson.M{})
    if err != nil {
        c.JSON(500, gin.H{"error": "Error fetching highlights"})
        return
    }
    defer cursor.Close(context.Background())
    
    if err = cursor.All(context.Background(), &highlights); err != nil {
        c.JSON(500, gin.H{"error": "Error decoding highlights"})
        return
    }
    
    // Add user_reaction to each highlight
    response := make([]map[string]interface{}, len(highlights))
    for i, highlight := range highlights {
        highlightMap := map[string]interface{}{
            "id":          highlight.ID.Hex(),
            "match_title": highlight.MatchTitle,
            "youtube_url": highlight.YoutubeURL,
            "club_ids":    highlight.ClubIDs,
            "created_at":  highlight.CreatedAt,
            "reactions":   highlight.Reactions,
        }
        
        // Add user's reaction if user_id provided
        if userID != "" {
            userReaction := getUserReaction(userID, "highlight", highlight.ID.Hex())
            if userReaction != "" {
                highlightMap["user_reaction"] = userReaction
            }
        }
        
        response[i] = highlightMap
    }
    
    c.JSON(200, response)
}
```

### Step 8: Update GET /api/feed/all Endpoint

```go
func GetAllFeed(c *gin.Context) {
    userID := c.Query("user_id") // Optional
    
    // Get all content
    var contents []Content
    contentCursor, _ := contentCollection.Find(context.Background(), bson.M{})
    contentCursor.All(context.Background(), &contents)
    
    // Get all highlights
    var highlights []Highlight
    highlightCursor, _ := highlightsCollection.Find(context.Background(), bson.M{})
    highlightCursor.All(context.Background(), &highlights)
    
    // Combine into feed
    feed := []map[string]interface{}{}
    
    // Add content items
    for _, content := range contents {
        item := map[string]interface{}{
            "id":         content.ID.Hex(),
            "type":       "news",
            "title":      content.Title,
            "body":       content.Body,
            "image_url":  content.ImageURL,
            "category":   content.Category,
            "club_id":    content.ClubID,
            "created_at": content.CreatedAt,
            "reactions":  content.Reactions,
        }
        
        if userID != "" {
            userReaction := getUserReaction(userID, "news", content.ID.Hex())
            if userReaction != "" {
                item["user_reaction"] = userReaction
            }
        }
        
        feed = append(feed, item)
    }
    
    // Add highlight items
    for _, highlight := range highlights {
        item := map[string]interface{}{
            "id":          highlight.ID.Hex(),
            "type":        "highlight",
            "title":       highlight.MatchTitle,
            "video_url":   highlight.YoutubeURL,
            "club_ids":    highlight.ClubIDs,
            "created_at":  highlight.CreatedAt,
            "reactions":   highlight.Reactions,
        }
        
        if userID != "" {
            userReaction := getUserReaction(userID, "highlight", highlight.ID.Hex())
            if userReaction != "" {
                item["user_reaction"] = userReaction
            }
        }
        
        feed = append(feed, item)
    }
    
    // Sort by created_at DESC
    sort.Slice(feed, func(i, j int) bool {
        return feed[i]["created_at"].(time.Time).After(feed[j]["created_at"].(time.Time))
    })
    
    c.JSON(200, gin.H{
        "feed":        feed,
        "total_items": len(feed),
    })
}
```

## Testing the Integration

### 1. Test Adding Reaction

```bash
# Add a reaction
curl -X POST http://localhost:8080/api/reactions \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-123",
    "content_type": "news",
    "content_id": "507f1f77bcf86cd799439011",
    "reaction_type": "like"
  }'

# Response should be:
{
  "success": true,
  "message": "Reaction added",
  "counts": {
    "like": 1,
    "love": 0,
    "wow": 0,
    "sad": 0,
    "angry": 0
  }
}
```

### 2. Test Getting Content with Reactions

```bash
# Get content (should now include reactions)
curl "http://localhost:8080/api/content/507f1f77bcf86cd799439011?user_id=test-user-123"

# Response should include:
{
  "id": "507f1f77bcf86cd799439011",
  "title": {...},
  "body": {...},
  "reactions": {
    "like": 1,
    "love": 0,
    "wow": 0,
    "sad": 0,
    "angry": 0
  },
  "user_reaction": "like"
}
```

### 3. Test Feed with Reactions

```bash
# Get feed (should include reactions on all items)
curl "http://localhost:8080/api/feed/all?user_id=test-user-123"

# Each item should have reactions and user_reaction
```

## Mobile App Changes (Already Done)

The mobile app is already configured to:
1. Parse `reactions` field from responses
2. Parse `user_reaction` field from responses
3. Display reactions using TelegramReactionBar
4. Send user_id in API calls

## Summary for Backend Team

### Required Changes:

1. **Add `reactions` field to Content and Highlight models**
   - Type: ReactionCounts (like, love, wow, sad, angry)
   - Initialize to zeros for new items

2. **Run migration to add reactions to existing data**
   - Use provided MongoDB script

3. **Update ALL content/highlight endpoints to include:**
   - `reactions` object with counts
   - `user_reaction` string (if user_id provided)

4. **Endpoints to update:**
   - GET /api/content
   - GET /api/content/:id
   - GET /api/highlights
   - GET /api/highlights/:id
   - GET /api/feed/all

5. **Optional: Accept user_id query parameter**
   - To return user's reaction
   - Example: `/api/content?user_id=xxx`

### Testing Checklist:

- [ ] Reactions field exists in database
- [ ] New content has reactions initialized
- [ ] GET /api/content returns reactions
- [ ] GET /api/highlights returns reactions
- [ ] GET /api/feed/all returns reactions
- [ ] user_reaction shows correctly when user_id provided
- [ ] Reaction counts update when reactions added/removed

Once these changes are made, reactions will appear in the mobile app!
