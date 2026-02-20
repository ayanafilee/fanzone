# Mobile App Quick Start Guide

## 🚀 Getting Started

Your FanZone mobile app can now access all content **without authentication**!

## Base URL
```
http://your-server:8080/api
```

## 📱 Essential Endpoints

### 1. Get All Content (Main Feed)
```http
GET /api/feed/all
```
Returns news + highlights from all clubs, sorted newest first.

### 2. Get All Clubs
```http
GET /api/clubs
```
Returns list of all clubs with logos.

### 3. Get Languages
```http
GET /api/languages
```
Returns supported languages: English, Amharic, Oromo.

### 4. Get News Details
```http
GET /api/news/:id
```
Returns full news article with multilingual content.

### 5. Get Highlight Details
```http
GET /api/highlights/:id
```
Returns video URL and match details.

### 6. Get Watch Platforms
```http
GET /api/watch-platforms
```
Returns streaming platforms where users can watch matches.

## 🎯 Simple Implementation

### Step 1: Fetch Feed
```javascript
const response = await fetch('http://your-server:8080/api/feed/all');
const data = await response.json();

// data.feed contains array of news and highlights
data.feed.forEach(item => {
  if (item.type === 'news') {
    console.log(item.title.en); // English title
  } else if (item.type === 'highlight') {
    console.log(item.video_url); // YouTube URL
  }
});
```

### Step 2: Display Multilingual Content
```javascript
// User selects language (stored locally)
const userLanguage = 'am'; // or 'en', 'om'

// Display news in user's language
const title = newsItem.title[userLanguage] || newsItem.title.en;
const body = newsItem.body[userLanguage] || newsItem.body.en;
```

### Step 3: Filter by Club (Client-Side)
```javascript
// User selects favorite club (stored locally)
const favoriteClubId = '507f1f77bcf86cd799439011';

// Filter feed for favorite club
const myClubFeed = allFeed.filter(item => {
  if (item.type === 'news') {
    return item.club_id === favoriteClubId;
  } else if (item.type === 'highlight') {
    return item.club_ids.includes(favoriteClubId);
  }
  return false;
});
```

## 📊 Response Examples

### Feed Response
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
      "image_url": "https://example.com/news.jpg",
      "club_id": "507f1f77bcf86cd799439012",
      "created_at": "2024-01-15T10:00:00Z"
    },
    {
      "id": "507f1f77bcf86cd799439014",
      "type": "highlight",
      "title": "Arsenal vs Chelsea",
      "video_url": "https://youtube.com/watch?v=abc123",
      "club_ids": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439015"]
    }
  ],
  "total_items": 2
}
```

### Clubs Response
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Arsenal FC",
    "logo_url": "https://example.com/arsenal.png",
    "league_id": "507f1f77bcf86cd799439020"
  }
]
```

## 🎨 UI Flow

```
App Launch
    ↓
[Optional] Language Selection
    ↓
[Optional] Favorite Club Selection
    ↓
Main Feed Screen
    ├── All News Tab (GET /api/feed/all)
    ├── My Club Tab (filter client-side)
    ├── Clubs Tab (GET /api/clubs)
    └── Watch Tab (GET /api/watch-platforms)
```

## 💾 Local Storage

Store user preferences locally (no server needed):

```javascript
// Save preferences
localStorage.setItem('userLanguage', 'en');
localStorage.setItem('favoriteClubId', '507f1f77bcf86cd799439011');

// Load preferences
const language = localStorage.getItem('userLanguage') || 'en';
const clubId = localStorage.getItem('favoriteClubId');
```

## 🔍 Filtering Options

### Filter News by Club
```http
GET /api/content?club_id=507f1f77bcf86cd799439011
```

### Filter Highlights by Club
```http
GET /api/highlights?club_id=507f1f77bcf86cd799439011
```

### Filter News by Category
```http
GET /api/content?category=transfer_news
```

## ✅ No Authentication Needed!

- ❌ No login/signup required
- ❌ No token management
- ❌ No Authorization headers
- ✅ Direct API access
- ✅ Instant content access
- ✅ Privacy-friendly

## 🧪 Testing

Test any endpoint directly in your browser or with curl:

```bash
# Get all feed
curl http://localhost:8080/api/feed/all

# Get clubs
curl http://localhost:8080/api/clubs

# Get news by ID
curl http://localhost:8080/api/news/507f1f77bcf86cd799439011
```

## 📱 Platform-Specific Examples

### React Native
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fetch feed
const fetchFeed = async () => {
  const response = await fetch('http://your-server:8080/api/feed/all');
  const data = await response.json();
  return data.feed;
};

// Save language preference
await AsyncStorage.setItem('language', 'am');

// Get language preference
const language = await AsyncStorage.getItem('language') || 'en';
```

### Flutter
```dart
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

// Fetch feed
Future<List<dynamic>> fetchFeed() async {
  final response = await http.get(
    Uri.parse('http://your-server:8080/api/feed/all')
  );
  final data = jsonDecode(response.body);
  return data['feed'];
}

// Save language preference
final prefs = await SharedPreferences.getInstance();
await prefs.setString('language', 'am');

// Get language preference
final language = prefs.getString('language') ?? 'en';
```

### Swift (iOS)
```swift
// Fetch feed
func fetchFeed() async throws -> [FeedItem] {
    let url = URL(string: "http://your-server:8080/api/feed/all")!
    let (data, _) = try await URLSession.shared.data(from: url)
    let response = try JSONDecoder().decode(FeedResponse.self, from: data)
    return response.feed
}

// Save language preference
UserDefaults.standard.set("am", forKey: "language")

// Get language preference
let language = UserDefaults.standard.string(forKey: "language") ?? "en"
```

### Kotlin (Android)
```kotlin
// Fetch feed
suspend fun fetchFeed(): List<FeedItem> {
    val response = client.get("http://your-server:8080/api/feed/all")
    return response.body<FeedResponse>().feed
}

// Save language preference
val prefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
prefs.edit().putString("language", "am").apply()

// Get language preference
val language = prefs.getString("language", "en")
```

## 🎯 Key Features to Implement

1. **Pull-to-Refresh** - Reload feed on user swipe
2. **Infinite Scroll** - Load more content as user scrolls
3. **Image Caching** - Cache images for offline viewing
4. **Video Player** - Embed YouTube videos for highlights
5. **Search** - Filter content by keywords (client-side)
6. **Favorites** - Save favorite clubs locally
7. **Share** - Share news/highlights to social media
8. **Dark Mode** - Support light/dark themes

## 📚 Full Documentation

For complete API documentation, see:
- `mobiledocumentation.txt` - Detailed endpoint documentation
- `PUBLIC_API_CHANGES.md` - Architecture and changes
- `API_ENDPOINTS.md` - Complete API reference

## 🆘 Support

For questions or issues:
1. Check `mobiledocumentation.txt` for detailed docs
2. Test endpoints with curl or Postman
3. Contact backend development team

## 🚀 You're Ready!

Start building your mobile app with these simple, public endpoints. No authentication complexity, just pure content delivery!
