# For Backend Team: Reactions Integration

## Current Status

✅ Mobile app can send reactions (POST /api/reactions works)
✅ Backend processes reactions successfully
❌ Reactions don't show in mobile app

## Why Reactions Don't Show

The mobile app expects `reactions` and `user_reaction` fields in ALL content/highlight responses, but the backend is not returning them.

## What Needs to Be Done

### 1. Add Reactions Field to Database Models

Add this to your Content and Highlight models:

```go
type ReactionCounts struct {
    Like  int `bson:"like" json:"like"`
    Love  int `bson:"love" json:"love"`
    Wow   int `bson:"wow" json:"wow"`
    Sad   int `bson:"sad" json:"sad"`
    Angry int `bson:"angry" json:"angry"`
}

// Add to Content model
type Content struct {
    // ... existing fields
    Reactions ReactionCounts `bson:"reactions" json:"reactions"`
}

// Add to Highlight model
type Highlight struct {
    // ... existing fields
    Reactions ReactionCounts `bson:"reactions" json:"reactions"`
}
```

### 2. Run Migration Script

Add reactions field to existing data:

```javascript
// MongoDB
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

### 3. Update These Endpoints

All these endpoints must return `reactions` field:

#### GET /api/content
```json
[
  {
    "id": "...",
    "title": {...},
    "body": {...},
    "reactions": {
      "like": 45,
      "love": 23,
      "wow": 12,
      "sad": 3,
      "angry": 1
    },
    "user_reaction": "like"
  }
]
```

#### GET /api/content/:id
```json
{
  "id": "...",
  "title": {...},
  "body": {...},
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

#### GET /api/highlights
```json
[
  {
    "id": "...",
    "match_title": "...",
    "youtube_url": "...",
    "reactions": {
      "like": 30,
      "love": 15,
      "wow": 8,
      "sad": 2,
      "angry": 0
    },
    "user_reaction": "love"
  }
]
```

#### GET /api/highlights/:id
```json
{
  "id": "...",
  "match_title": "...",
  "youtube_url": "...",
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

#### GET /api/feed/all
```json
{
  "feed": [
    {
      "id": "...",
      "type": "news",
      "title": {...},
      "reactions": {
        "like": 45,
        "love": 23,
        "wow": 12,
        "sad": 3,
        "angry": 1
      },
      "user_reaction": "like"
    },
    {
      "id": "...",
      "type": "highlight",
      "title": "...",
      "reactions": {
        "like": 30,
        "love": 15,
        "wow": 8,
        "sad": 2,
        "angry": 0
      },
      "user_reaction": "love"
    }
  ]
}
```

### 4. Accept user_id Query Parameter

All GET endpoints should accept optional `user_id` parameter:

```
GET /api/content?user_id=xxx
GET /api/content/:id?user_id=xxx
GET /api/highlights?user_id=xxx
GET /api/highlights/:id?user_id=xxx
GET /api/feed/all?user_id=xxx
```

When `user_id` is provided, include `user_reaction` field in response.

### 5. Update Reaction Counts

When a reaction is added/removed, update the content/highlight:

```go
// When reaction added
db.Collection("content").UpdateOne(
    bson.M{"_id": contentID},
    bson.M{"$inc": bson.M{
        "reactions.like": 1,  // or love, wow, sad, angry
    }},
)

// When reaction removed
db.Collection("content").UpdateOne(
    bson.M{"_id": contentID},
    bson.M{"$inc": bson.M{
        "reactions.like": -1,
    }},
)

// When reaction changed (e.g., from like to love)
db.Collection("content").UpdateOne(
    bson.M{"_id": contentID},
    bson.M{"$inc": bson.M{
        "reactions.like": -1,
        "reactions.love": 1,
    }},
)
```

## Testing

### Test 1: Add Reaction and Verify Count

```bash
# 1. Get initial count
curl "http://localhost:8080/api/content/CONTENT_ID"
# Should show: "reactions": {"like": 0, ...}

# 2. Add reaction
curl -X POST http://localhost:8080/api/reactions \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-123",
    "content_type": "news",
    "content_id": "CONTENT_ID",
    "reaction_type": "like"
  }'

# 3. Get count again
curl "http://localhost:8080/api/content/CONTENT_ID"
# Should show: "reactions": {"like": 1, ...}
```

### Test 2: Verify User's Reaction

```bash
# Get content with user_id
curl "http://localhost:8080/api/content/CONTENT_ID?user_id=test-123"

# Should include:
# "reactions": {"like": 1, ...}
# "user_reaction": "like"
```

### Test 3: Verify Feed

```bash
# Get feed with user_id
curl "http://localhost:8080/api/feed/all?user_id=test-123"

# Each item should have:
# "reactions": {...}
# "user_reaction": "..." (if user reacted)
```

## Implementation Priority

### Critical (Must Have)
1. Add `reactions` field to models
2. Run migration script
3. Return `reactions` in all GET endpoints
4. Update counts when reactions added/removed

### Important (Should Have)
5. Accept `user_id` query parameter
6. Return `user_reaction` when user_id provided

### Optional (Nice to Have)
7. Cache reaction counts
8. Optimize database queries

## Code Example (Go)

```go
// Helper function to get user's reaction
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
    
    return reaction.ReactionType
}

// Update GET /api/content/:id
func GetContentByID(c *gin.Context) {
    id := c.Param("id")
    userID := c.Query("user_id") // Get from query param
    
    var content Content
    // ... fetch content from database
    
    response := map[string]interface{}{
        "id":         content.ID.Hex(),
        "title":      content.Title,
        "body":       content.Body,
        "reactions":  content.Reactions, // Include reactions
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

## Expected Result

After implementing these changes:

1. ✅ Reactions will show on all content/highlights
2. ✅ Counts will update in real-time
3. ✅ User's reaction will be highlighted
4. ✅ Mobile app will work perfectly

## Questions?

See these documents:
- `BACKEND_REACTIONS_INTEGRATION.md` - Complete implementation guide
- `REACTIONS_TROUBLESHOOTING.md` - Debugging guide
- `interactivity_backend.txt` - Full backend documentation

## Summary

**What's needed:**
1. Add `reactions` field to database models
2. Return `reactions` in all GET endpoints
3. Update counts when reactions change
4. Return `user_reaction` when user_id provided

**Priority:** HIGH - Reactions feature is complete on mobile but can't work without backend changes

**Estimated time:** 2-4 hours

**Files to update:**
- Models (Content, Highlight)
- GET /api/content
- GET /api/content/:id
- GET /api/highlights
- GET /api/highlights/:id
- GET /api/feed/all
- POST /api/reactions (update counts)
- DELETE /api/reactions (update counts)
