# FanZone Mobile API Endpoints

## 🔐 Authentication

### POST /api/auth/register
Creates a new user account with language and favorite club preferences.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "language": "en",
  "fav_club_id": "507f1f77bcf86cd799439011"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully"
}
```

---

### POST /api/auth/login
Authenticates user and returns JWT tokens.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "language": "en",
    "fav_club_id": "507f1f77bcf86cd799439012",
    "profile_image_url": "",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### POST /api/auth/refresh
Issues new access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGc..."
}
```

---

### POST /api/auth/logout
Invalidates refresh token session.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

## 👤 User Profile

### GET /api/users/me
Returns authenticated user profile data.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "language": "en",
  "fav_club_id": "507f1f77bcf86cd799439012",
  "role": "user",
  "profile_image_url": "",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### PUT /api/users/me
Updates user profile (name, email, language, favorite club, profile image).

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "name": "John Updated",
  "language": "am",
  "fav_club_id": "507f1f77bcf86cd799439013",
  "profile_image_url": "https://example.com/image.jpg"
}
```

**Response:** `200 OK`
```json
{
  "message": "Profile updated successfully"
}
```

---

### PATCH /api/users/me/favorite-club
Updates only the user's favorite club.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "fav_club_id": "507f1f77bcf86cd799439013"
}
```

**Response:** `200 OK`
```json
{
  "message": "Favorite club updated successfully"
}
```

---

### PATCH /api/users/me/language
Updates only the user's preferred language.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "language": "om"
}
```

**Response:** `200 OK`
```json
{
  "message": "Language updated successfully"
}
```

---

## 📰 Feed (Core Mobile Pages)

### GET /api/feed/my-club
Returns personalized feed (news + highlights) for user's favorite club, sorted by newest first.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** `200 OK`
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
      "video_url": "https://youtube.com/watch?v=...",
      "club_ids": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439015"],
      "created_at": "2024-01-14T18:00:00Z"
    }
  ],
  "club_id": "507f1f77bcf86cd799439012",
  "total_items": 2
}
```

---

### GET /api/feed/all
Returns global feed (all news + highlights) sorted by newest first.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** `200 OK`
```json
{
  "feed": [
    {
      "id": "507f1f77bcf86cd799439011",
      "type": "news",
      "title": {...},
      "body": {...},
      "image_url": "https://example.com/news.jpg",
      "category": "transfer_news",
      "club_id": "507f1f77bcf86cd799439012",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "total_items": 50
}
```

---

## 🏟 Clubs

### GET /api/clubs
Returns all available clubs.

**Authentication:** Not Required (Public Endpoint)

**Response:** `200 OK`
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

---

### GET /api/clubs/:clubId
Returns detailed information for a specific club.

**Authentication:** Not Required (Public Endpoint)

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Arsenal FC",
  "logo_url": "https://example.com/arsenal.png",
  "league_id": "507f1f77bcf86cd799439020"
}
```

---

## 📰 News

### GET /api/news/:newsId
Returns full details of a single news article.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": {
    "en": "Transfer News",
    "am": "የዝውውር ዜና",
    "om": "Oduu Jijjiirraa"
  },
  "body": {
    "en": "Full article content...",
    "am": "ሙሉ ጽሑፍ...",
    "om": "Barreeffama guutuu..."
  },
  "image_url": "https://example.com/news.jpg",
  "category": "transfer_news",
  "club_id": "507f1f77bcf86cd799439012",
  "created_at": "2024-01-15T10:00:00Z"
}
```

---

## 🎥 Highlights

### GET /api/highlights/:highlightId
Returns detailed highlight information including video URL.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439014",
  "match_title": "Arsenal vs Chelsea - Full Highlights",
  "youtube_url": "https://youtube.com/watch?v=...",
  "club_ids": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439015"]
}
```

---

## 📺 Watch (Streaming Platforms)

### GET /api/watch-platforms
Returns list of streaming platforms/apps.

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `club_id` (optional): Filter by club (not yet implemented in data model)

**Response:** `200 OK`
```json
[
  {
    "id": "507f1f77bcf86cd799439030",
    "name": "ESPN+",
    "url": "https://espn.com",
    "type": "streaming",
    "logo_url": "https://example.com/espn.png"
  },
  {
    "id": "507f1f77bcf86cd799439031",
    "name": "DAZN",
    "url": "https://dazn.com",
    "type": "streaming",
    "logo_url": "https://example.com/dazn.png"
  }
]
```

---

## 🌍 Localization

### GET /api/languages
Returns list of supported languages.

**Authentication:** Not Required (Public Endpoint)

**Response:** `200 OK`
```json
{
  "languages": [
    {
      "code": "en",
      "name": "English"
    },
    {
      "code": "am",
      "name": "Amharic"
    },
    {
      "code": "om",
      "name": "Oromo"
    }
  ],
  "total": 3
}
```

---

## 📝 Notes

### Public Endpoints
The following endpoints do NOT require authentication:
- `/api/auth/*` - All authentication endpoints
- `/api/clubs` and `/api/clubs/:id` - Club listing and details
- `/api/leagues` and `/api/leagues/:id` - League listing and details
- `/api/languages` - Supported languages

These public endpoints allow users to browse clubs and select preferences during onboarding before registration.

### Endpoint Aliases
- `/api/watch-platforms` is an alias for `/api/watch-links`
- `/api/news/:id` is an alias for `/api/content/:id`
- `/api/users/me` is the new standard, `/api/user/profile` is legacy

### Authentication
All endpoints except `/api/auth/*` require a valid JWT access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Multilingual Content
News articles use the `MultiLangString` structure with `en`, `am`, and `om` fields. Clients should display content based on the user's selected language preference.

### Feed Sorting
Both feed endpoints (`/api/feed/my-club` and `/api/feed/all`) return items sorted by `created_at` in descending order (newest first).

### Error Responses
All endpoints return standard error responses:
```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error
