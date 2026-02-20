# Club-Specific Feed Endpoint

## ✅ NEW ENDPOINT ADDED

### Get Club Feed (Mixed News + Highlights)
```http
GET /api/feed/club/:id
```

**Description:**
Returns a mixed feed of news and highlights for a specific club, sorted by newest first.

---

## Usage

### Basic Request
```bash
GET /api/feed/club/507f1f77bcf86cd799439012
```

### Response
```json
{
  "feed": [
    {
      "id": "507f1f77bcf86cd799439011",
      "type": "news",
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
    },
    {
      "id": "507f1f77bcf86cd799439014",
      "type": "highlight",
      "title": "Arsenal vs Chelsea - Full Highlights",
      "video_url": "https://youtube.com/watch?v=abc123",
      "club_ids": [
        "507f1f77bcf86cd799439012",
        "507f1f77bcf86cd799439015"
      ],
      "created_at": "2024-01-14T18:00:00Z"
    }
  ],
  "club_id": "507f1f77bcf86cd799439012",
  "total_items": 2
}
```

---

## Features

✅ **Mixed Content** - Combines news and highlights in one response
✅ **Sorted** - Items sorted by created_at DESC (newest first)
✅ **Club-Specific** - Only content related to the specified club
✅ **Public** - No authentication required
✅ **Validated** - Checks if club exists before fetching

---

## Feed Endpoints Comparison

| Endpoint | Description | Use Case |
|----------|-------------|----------|
| GET /api/feed/all | All clubs feed | Home/Explore screen |
| GET /api/feed/club/:id | Single club feed | Club profile/detail screen |
| GET /api/feed/my-club | User's favorite club | Requires authentication |

---

## Implementation Example

### JavaScript/React
```javascript
async function getClubFeed(clubId) {
  const response = await fetch(`http://your-server:8080/api/feed/club/${clubId}`);
  const data = await response.json();
  
  return data.feed; // Array of mixed news and highlights
}

// Usage
const arsenalFeed = await getClubFeed('507f1f77bcf86cd799439012');
arsenalFeed.forEach(item => {
  if (item.type === 'news') {
    console.log('News:', item.title.en);
  } else if (item.type === 'highlight') {
    console.log('Highlight:', item.title);
  }
});
```

### Flutter/Dart
```dart
Future<List<FeedItem>> getClubFeed(String clubId) async {
  final response = await http.get(
    Uri.parse('http://your-server:8080/api/feed/club/$clubId')
  );
  
  final data = jsonDecode(response.body);
  return (data['feed'] as List)
      .map((item) => FeedItem.fromJson(item))
      .toList();
}
```

### Swift/iOS
```swift
func getClubFeed(clubId: String) async throws -> [FeedItem] {
    let url = URL(string: "http://your-server:8080/api/feed/club/\(clubId)")!
    let (data, _) = try await URLSession.shared.data(from: url)
    let response = try JSONDecoder().decode(ClubFeedResponse.self, from: data)
    return response.feed
}
```

### Kotlin/Android
```kotlin
suspend fun getClubFeed(clubId: String): List<FeedItem> {
    val response = client.get("http://your-server:8080/api/feed/club/$clubId")
    return response.body<ClubFeedResponse>().feed
}
```

---

## Error Handling

### Invalid Club ID
```json
{
  "error": "Invalid club ID"
}
```
Status: 400 Bad Request

### Club Not Found
```json
{
  "error": "Club not found"
}
```
Status: 404 Not Found

### Server Error
```json
{
  "error": "Error fetching news"
}
```
Status: 500 Internal Server Error

---

## UI Implementation Tips

### Club Profile Screen
```
┌─────────────────────────────┐
│  Arsenal FC                 │
│  [Logo]                     │
├─────────────────────────────┤
│  📰 Latest News & Highlights│
├─────────────────────────────┤
│  [News Card]                │
│  Big Win Today              │
│  The team won 3-0...        │
├─────────────────────────────┤
│  [Video Card]               │
│  ▶ Arsenal vs Chelsea       │
│  Full Match Highlights      │
├─────────────────────────────┤
│  [News Card]                │
│  Transfer Update            │
│  New signing announced...   │
└─────────────────────────────┘
```

### Code Example
```javascript
function ClubProfileScreen({ clubId }) {
  const [feed, setFeed] = useState([]);
  
  useEffect(() => {
    fetch(`/api/feed/club/${clubId}`)
      .then(res => res.json())
      .then(data => setFeed(data.feed));
  }, [clubId]);
  
  return (
    <div>
      <ClubHeader clubId={clubId} />
      <FeedList items={feed} />
    </div>
  );
}
```

---

## Performance Tips

1. **Caching** - Cache feed for 5-10 minutes
2. **Pull-to-Refresh** - Allow manual refresh
3. **Pagination** - Consider implementing if feed is large
4. **Lazy Loading** - Load images as user scrolls

---

## Summary

**This is the endpoint you need for club-specific mixed content!**

- ✅ Single API call
- ✅ Mixed news + highlights
- ✅ Sorted by date
- ✅ Club-specific
- ✅ No authentication needed

Use this endpoint when displaying a club's profile or detail page to show all their latest content in one unified feed.
