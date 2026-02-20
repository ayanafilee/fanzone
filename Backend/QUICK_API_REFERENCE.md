# Quick API Reference for Mobile App

## Base URL
```
http://your-server:8080/api
```

## Public Endpoints (No Auth Required)
```
POST   /auth/register          - Create new user account
POST   /auth/login             - Login and get tokens
POST   /auth/refresh           - Refresh access token
POST   /auth/logout            - Logout and invalidate token
GET    /clubs                  - List all clubs (for onboarding)
GET    /clubs/:id              - Get club details
GET    /languages              - Get supported languages (for onboarding)
```

## User Profile (Auth Required)
```
GET    /users/me                      - Get my profile
PUT    /users/me                      - Update profile (all fields)
PATCH  /users/me/favorite-club        - Update favorite club only
PATCH  /users/me/language             - Update language only
```

## Feed - Main App Screens (Auth Required)
```
GET    /feed/my-club           - My Club timeline (personalized)
GET    /feed/all               - All News timeline (global)
```

## Clubs (Auth Required)
```
GET    /clubs                  - List all clubs
GET    /clubs/:id              - Get club details
```

## Content (Auth Required)
```
GET    /news/:id               - Get news article details
GET    /highlights/:id         - Get highlight video details
```

## Watch Tab (Auth Required)
```
GET    /watch-platforms        - List streaming platforms
GET    /watch-platforms?club_id=xxx  - Filter by club (coming soon)
```

## Settings (Auth Required)
```
GET    /languages              - Get supported languages
```

## Request Headers
All authenticated endpoints require:
```
Authorization: Bearer <access_token>
```

## Response Format
Success:
```json
{
  "data": {...}
}
```

Error:
```json
{
  "error": "Error message"
}
```

## Supported Languages
- `en` - English
- `am` - Amharic  
- `om` - Oromo

## Feed Item Types
- `news` - News articles with multilingual content
- `highlight` - Match highlight videos

## Quick Start Example

### 1. Register
```bash
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "language": "en",
  "fav_club_id": "507f1f77bcf86cd799439011"
}
```

### 2. Login
```bash
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```
Response includes `access_token` and `refresh_token`

### 3. Get My Club Feed
```bash
GET /api/feed/my-club
Authorization: Bearer <access_token>
```

### 4. Change Favorite Club
```bash
PATCH /api/users/me/favorite-club
Authorization: Bearer <access_token>
{
  "fav_club_id": "507f1f77bcf86cd799439012"
}
```

### 5. Change Language
```bash
PATCH /api/users/me/language
Authorization: Bearer <access_token>
{
  "language": "am"
}
```

## Mobile App Flow

1. **Onboarding**
   - GET /api/languages (show language selector)
   - GET /api/clubs (show club selector)
   - POST /api/auth/register (create account)

2. **Home Screen**
   - GET /api/feed/my-club (show personalized feed)
   - Tap item → GET /api/news/:id or /api/highlights/:id

3. **All News Tab**
   - GET /api/feed/all (show global feed)

4. **Watch Tab**
   - GET /api/watch-platforms (show streaming options)

5. **Profile/Settings**
   - GET /api/users/me (show profile)
   - PATCH /api/users/me/language (change language)
   - PATCH /api/users/me/favorite-club (change club)
