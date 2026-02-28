# FanZone Backend Deployment Guide

## Prerequisites

- Go 1.21 or higher
- MongoDB database
- Firebase project (for push notifications)

## Environment Variables

Create a `.env.local` file (or set environment variables in your deployment platform):

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
DB_NAME=your_database_name
ACCESS_SECRET=your_access_secret_key
REFRESH_SECRET=your_refresh_secret_key
PORT=8080
```

See `.env.example` for template.

## Firebase Configuration

The Firebase service account key is required for push notifications.

**File location:** `internal/config/fanzone-c7f93-firebase-adminsdk-fbsvc-7fa1955ab1.json`

See `FIREBASE_SETUP.md` for detailed instructions.

## Render Deployment

### Configuration

- **Branch:** main
- **Region:** Oregon (US West)
- **Root Directory:** Backend
- **Build Command:** `go build -o server ./cmd/server`
- **Start Command:** `./server`

### Environment Variables (Add in Render Dashboard)

```
MONGO_URI=your_mongodb_connection_string
DB_NAME=your_database_name
ACCESS_SECRET=your_access_secret
REFRESH_SECRET=your_refresh_secret
PORT=8080
```

### Secret Files (Add in Render Dashboard)

1. Go to Environment tab
2. Scroll to "Secret Files"
3. Add file: `internal/config/fanzone-c7f93-firebase-adminsdk-fbsvc-7fa1955ab1.json`
4. Paste Firebase service account JSON content

## Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd Backend
```

2. Install dependencies:
```bash
go mod download
```

3. Create `.env.local` file with your configuration

4. Add Firebase service account key to `internal/config/`

5. Run the server:
```bash
go run cmd/server/main.go
```

Server will start on `http://localhost:8080`

## Build for Production

```bash
go build -o server ./cmd/server
./server
```

## API Documentation

- **Mobile API:** See `mobiledocumentation.txt`
- **League Management:** See `league.txt`
- **Push Notifications:** See `PUSH_NOTIFICATIONS_DOCUMENTATION.txt`

## Features

- ✅ Public API for mobile users (no authentication required)
- ✅ Admin authentication and authorization
- ✅ CRUD operations for leagues, clubs, content, highlights
- ✅ Push notifications via Firebase Cloud Messaging
- ✅ Multilingual content support (English, Amharic, Oromo)
- ✅ Topic-based notifications for clubs

## Endpoints

### Public Endpoints (No Auth)
- GET /api/clubs
- GET /api/leagues
- GET /api/feed/all
- GET /api/content
- GET /api/highlights
- GET /api/watch-platforms
- GET /api/languages

### Admin Endpoints (Auth Required)
- POST /api/admin/clubs
- POST /api/admin/leagues
- POST /api/admin/content
- POST /api/admin/highlights
- And more...

### Super Admin Endpoints
- POST /api/super-admin/register-admin
- GET /api/super-admin/admins

## Health Check

Check if server is running:
```bash
curl http://localhost:8080/api/clubs
```

## Troubleshooting

### FCM Initialization Failed
- Check Firebase service account key exists
- Verify file path is correct
- Check Firebase project is active
- Server will still run but notifications disabled

### MongoDB Connection Failed
- Verify MONGO_URI is correct
- Check MongoDB cluster is accessible
- Verify IP whitelist in MongoDB Atlas

### Port Already in Use
- Change PORT in environment variables
- Or kill process using the port

## Security Notes

⚠️ **Never commit these files:**
- `.env.local`
- `internal/config/fanzone-c7f93-firebase-adminsdk-fbsvc-7fa1955ab1.json`
- Any file with credentials or secrets

These are already in `.gitignore`.

## Support

For issues or questions, refer to the documentation files:
- `mobiledocumentation.txt`
- `league.txt`
- `PUSH_NOTIFICATIONS_DOCUMENTATION.txt`
- `FIREBASE_SETUP.md`
