# Reactions Troubleshooting Guide

## Problem: Reactions Don't Show on Content/Highlights

### Symptoms
- ✅ [+] button appears
- ✅ Reaction picker opens
- ✅ Can select reactions
- ✅ Backend processes the request (200 OK)
- ❌ Reactions don't appear on the content
- ❌ No reaction counts visible

### Root Cause
The backend is NOT returning reaction data in the feed/content responses.

## Solution

### For Backend Team

The backend must include `reactions` and `user_reaction` fields in ALL responses that return content or highlights.

**Required Changes:**

1. **Add reactions field to database models**
2. **Update all GET endpoints to include reactions**
3. **Return user's reaction when user_id is provided**

See `BACKEND_REACTIONS_INTEGRATION.md` for complete implementation guide.

### Quick Fix Checklist

#### Step 1: Verify Backend Returns Reactions

Test your API:

```bash
# Get a news item
curl "http://your-server:8080/api/content/CONTENT_ID"

# Response MUST include:
{
  "id": "...",
  "title": {...},
  "reactions": {          ← MUST BE PRESENT
    "like": 0,
    "love": 0,
    "wow": 0,
    "sad": 0,
    "angry": 0
  }
}
```

If `reactions` field is missing → Backend needs to be updated.

#### Step 2: Verify Reactions Update

```bash
# 1. Add a reaction
curl -X POST http://your-server:8080/api/reactions \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-123",
    "content_type": "news",
    "content_id": "CONTENT_ID",
    "reaction_type": "like"
  }'

# 2. Get the content again
curl "http://your-server:8080/api/content/CONTENT_ID"

# Response MUST show:
{
  "reactions": {
    "like": 1,          ← Should be 1 now
    "love": 0,
    "wow": 0,
    "sad": 0,
    "angry": 0
  }
}
```

If count didn't increase → Backend reaction logic needs fixing.

#### Step 3: Verify User's Reaction

```bash
# Get content with user_id
curl "http://your-server:8080/api/content/CONTENT_ID?user_id=test-123"

# Response MUST include:
{
  "reactions": {...},
  "user_reaction": "like"    ← MUST BE PRESENT
}
```

If `user_reaction` is missing → Backend needs to check user's reaction.

## Mobile App Debugging

### Check if Data is Received

Add this to your code temporarily:

```dart
// In news_detail_screen.dart, in _loadReactions()
print('📊 Reactions from news object: ${widget.news.reactions.toJson()}');
print('👤 User reaction: ${widget.news.userReaction}');
```

**Expected output:**
```
📊 Reactions from news object: {like: 45, love: 23, wow: 12, sad: 3, angry: 1}
👤 User reaction: like
```

**If you see:**
```
📊 Reactions from news object: {like: 0, love: 0, wow: 0, sad: 0, angry: 0}
👤 User reaction: null
```
→ Backend is not returning reaction data.

### Check Network Requests

1. Open Flutter DevTools
2. Go to Network tab
3. Load a news item
4. Check the response JSON
5. Verify `reactions` field exists

### Check Feed Service

Add logging to feed_service.dart:

```dart
// In getAllFeed()
print('📡 Feed URL: $url');
print('📡 Response: ${response.body}');
```

Check if `reactions` field is in the response.

## Common Issues

### Issue 1: Reactions Field Missing

**Symptom:** No reactions show at all

**Cause:** Backend doesn't have reactions field in database

**Fix:** Run migration script:
```javascript
db.content.updateMany(
  { reactions: { $exists: false } },
  { $set: { reactions: { like: 0, love: 0, wow: 0, sad: 0, angry: 0 } } }
);
```

### Issue 2: Counts Don't Update

**Symptom:** Can add reactions but counts stay at 0

**Cause:** Backend doesn't update content.reactions when reaction added

**Fix:** Update reaction handler to increment counts:
```go
// When reaction added
db.Collection("content").UpdateOne(
    bson.M{"_id": contentID},
    bson.M{"$inc": bson.M{"reactions.like": 1}},
)
```

### Issue 3: User's Reaction Not Highlighted

**Symptom:** Can add reactions but they're not highlighted

**Cause:** Backend doesn't return user_reaction field

**Fix:** Add user_reaction to response:
```go
userReaction := getUserReaction(userID, "news", contentID)
response["user_reaction"] = userReaction
```

### Issue 4: Reactions Show in Detail but Not in Feed

**Symptom:** Reactions work in detail screen but not in feed

**Cause:** Feed endpoint doesn't include reactions

**Fix:** Update GET /api/feed/all to include reactions for each item

## Testing Steps

### 1. Test Backend Directly

```bash
# Add reaction
curl -X POST http://localhost:8080/api/reactions \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","content_type":"news","content_id":"ID","reaction_type":"like"}'

# Get content
curl "http://localhost:8080/api/content/ID?user_id=test"

# Verify response has:
# - reactions.like = 1
# - user_reaction = "like"
```

### 2. Test Mobile App

```dart
// 1. Clear app data
// 2. Open app
// 3. Go to any news
// 4. Tap [+] button
// 5. Select reaction
// 6. Should see: 👍 1 (or whatever you selected)
// 7. Should be highlighted (green border)
```

### 3. Test Persistence

```dart
// 1. Add a reaction
// 2. Close app
// 3. Reopen app
// 4. Go to same news
// 5. Should still see your reaction highlighted
```

## Backend Implementation Priority

### Must Have (Critical)

1. ✅ Add `reactions` field to Content model
2. ✅ Add `reactions` field to Highlight model
3. ✅ Return `reactions` in GET /api/content
4. ✅ Return `reactions` in GET /api/highlights
5. ✅ Return `reactions` in GET /api/feed/all
6. ✅ Update `reactions` when reaction added/removed

### Should Have (Important)

7. ✅ Return `user_reaction` when user_id provided
8. ✅ Accept user_id query parameter in GET requests
9. ✅ Run migration to add reactions to existing data

### Nice to Have (Optional)

10. ⭕ Cache reaction counts for performance
11. ⭕ Batch fetch user reactions
12. ⭕ Add reaction analytics

## Quick Test Script

Save this as `test_reactions.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:8080/api"
USER_ID="test-user-123"
CONTENT_ID="YOUR_CONTENT_ID"

echo "1. Adding reaction..."
curl -X POST $BASE_URL/reactions \
  -H "Content-Type: application/json" \
  -d "{\"user_id\":\"$USER_ID\",\"content_type\":\"news\",\"content_id\":\"$CONTENT_ID\",\"reaction_type\":\"like\"}"

echo -e "\n\n2. Getting content..."
curl "$BASE_URL/content/$CONTENT_ID?user_id=$USER_ID"

echo -e "\n\n3. Getting feed..."
curl "$BASE_URL/feed/all?user_id=$USER_ID"
```

Run: `bash test_reactions.sh`

## Expected vs Actual

### Expected Behavior

```
1. User taps [+]
2. Selects ❤️
3. Sees: ❤️ 1 (highlighted)
4. Taps ❤️ again
5. Reaction removed
6. Taps 👍
7. Sees: 👍 1 (highlighted)
```

### If Not Working

```
1. User taps [+]
2. Selects ❤️
3. Sees: [+] (no change)
   ↓
   Backend not returning reactions
```

## Contact Backend Team

Send them:
1. `BACKEND_REACTIONS_INTEGRATION.md`
2. This troubleshooting guide
3. Example API responses showing missing fields

## Summary

**Problem:** Reactions don't show
**Cause:** Backend doesn't return reaction data
**Solution:** Backend must include `reactions` and `user_reaction` in all content/highlight responses

See `BACKEND_REACTIONS_INTEGRATION.md` for complete implementation guide.
