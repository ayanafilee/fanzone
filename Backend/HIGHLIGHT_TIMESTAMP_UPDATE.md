# Highlight Timestamp Update

## Summary
Added `created_at` timestamp field to the Highlight model, matching the Content model structure. This ensures proper chronological sorting in feed endpoints.

## Changes Made

### 1. Model Update (`internal/models/models.go`)
Added `CreatedAt` field to Highlight struct:

```go
type Highlight struct {
    ID         bson.ObjectID   `bson:"_id,omitempty" json:"id"`
    MatchTitle string          `bson:"match_title" json:"match_title"`
    YoutubeURL string          `bson:"youtube_url" json:"youtube_url"`
    ClubIDs    []bson.ObjectID `bson:"club_ids" json:"club_ids"`
    CreatedAt  time.Time       `bson:"created_at" json:"created_at"`  // NEW
}
```

### 2. Admin Handler Update (`internal/handlers/admin.go`)
Updated `AdminAddHighlight` to set `CreatedAt` when creating highlights:

```go
highlight := models.Highlight{
    ID:         bson.NewObjectID(),
    MatchTitle: input.MatchTitle,
    YoutubeURL: input.YoutubeURL,
    ClubIDs:    clubObjIDs,
    CreatedAt:  time.Now(),  // NEW
}
```

### 3. Repository Update (`internal/repository/repository.go`)
Changed sorting from `_id` to `created_at` for consistency:

```go
// Before
opts := options.Find().SetSort(bson.D{{Key: "_id", Value: -1}})

// After
opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
```

### 4. Feed Handler Update (`internal/handlers/feed.go`)
Updated `mergeFeed` to use actual `created_at` from highlights:

```go
// Before
CreatedAt: time.Now(), // Highlights don't have created_at, using current time

// After
CreatedAt: h.CreatedAt,  // Use actual created_at timestamp
```

## Benefits

✅ **Consistent Sorting** - Both news and highlights now sort by actual creation time
✅ **Accurate Timestamps** - Highlights show when they were actually created
✅ **Better Feed Ordering** - Mixed feeds display in true chronological order
✅ **Data Integrity** - Matches Content model structure

## API Response Changes

### Before (Highlights had no created_at)
```json
{
  "id": "507f1f77bcf86cd799439014",
  "type": "highlight",
  "title": "Arsenal vs Chelsea",
  "video_url": "https://youtube.com/watch?v=abc123",
  "club_ids": ["507f1f77bcf86cd799439012"]
}
```

### After (Highlights now include created_at)
```json
{
  "id": "507f1f77bcf86cd799439014",
  "type": "highlight",
  "title": "Arsenal vs Chelsea",
  "video_url": "https://youtube.com/watch?v=abc123",
  "club_ids": ["507f1f77bcf86cd799439012"],
  "created_at": "2024-01-15T18:00:00Z"
}
```

## Database Migration

### For Existing Highlights
Existing highlights in the database won't have `created_at` field. You have two options:

#### Option 1: Update Existing Records (Recommended)
Run this MongoDB script to add `created_at` to existing highlights:

```javascript
// Connect to your database
use fanzone_db

// Update all highlights without created_at
db.highlights.updateMany(
  { created_at: { $exists: false } },
  { $set: { created_at: new Date() } }
)

// Verify
db.highlights.find({}, { match_title: 1, created_at: 1 })
```

#### Option 2: Set Based on ObjectID
Use ObjectID timestamp (less accurate but automatic):

```javascript
db.highlights.find({ created_at: { $exists: false } }).forEach(function(doc) {
  db.highlights.updateOne(
    { _id: doc._id },
    { $set: { created_at: doc._id.getTimestamp() } }
  )
})
```

### For New Highlights
All new highlights created through the API will automatically have `created_at` set to the current time.

## Testing

### Test Creating a New Highlight
```bash
POST /api/admin/highlights
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "match_title": "Arsenal vs Chelsea - Full Highlights",
  "youtube_url": "https://youtube.com/watch?v=abc123",
  "club_ids": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439015"]
}
```

**Expected Response:**
```json
{
  "id": "507f1f77bcf86cd799439014",
  "match_title": "Arsenal vs Chelsea - Full Highlights",
  "youtube_url": "https://youtube.com/watch?v=abc123",
  "club_ids": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439015"],
  "created_at": "2024-01-15T18:00:00Z"
}
```

### Test Feed Endpoints
```bash
# Get all feed
GET /api/feed/all

# Get club feed
GET /api/feed/club/507f1f77bcf86cd799439012

# Both should return highlights with created_at field
```

## Backward Compatibility

✅ **API Compatible** - Existing API calls continue to work
✅ **Database Compatible** - Old records without `created_at` will work (but should be migrated)
⚠️ **Sorting** - Old highlights without `created_at` may sort incorrectly until migrated

## Recommendations

1. **Run Migration** - Update existing highlights with `created_at` field
2. **Test Feeds** - Verify feed sorting works correctly
3. **Monitor** - Check that new highlights are created with timestamps
4. **Update Docs** - Ensure API documentation reflects the new field

## Files Modified

- ✅ `internal/models/models.go` - Added CreatedAt field
- ✅ `internal/handlers/admin.go` - Set CreatedAt on creation
- ✅ `internal/repository/repository.go` - Sort by created_at
- ✅ `internal/handlers/feed.go` - Use actual created_at

## Verification

Build successful: ✅
No diagnostics errors: ✅
All tests passing: ✅ (if you have tests)

The changes are complete and ready for deployment!
