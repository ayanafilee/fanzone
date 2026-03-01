# FanZone Backend API

Go backend server for the FanZone mobile application.

## Features

- RESTful API for clubs, leagues, news, and highlights
- Push notifications via Firebase Cloud Messaging
- Anonymous reaction system (like, love, wow, sad, angry)
- Multi-language support (English, Amharic, Oromo)
- Admin and super admin roles
- Public API for mobile app (no authentication required)

## Quick Start

### Prerequisites

- Go 1.21 or higher
- MongoDB Atlas account
- Firebase project with FCM enabled

### Environment Setup

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Update `.env.local` with your credentials:
```
MONGO_URI=your_mongodb_connection_string
DB_NAME=fanzone
PORT=8080
ACCESS_SECRET=your_jwt_secret
REFRESH_SECRET=your_jwt_refresh_secret
```

3. Add Firebase service account key to `internal/config/`

### Build and Run

```bash
# Install dependencies
go mod download

# Build
go build -o server ./cmd/server

# Run
./server
```

## API Endpoints

### Public Endpoints (No Auth Required)

- `GET /api/clubs` - Get all clubs
- `GET /api/leagues` - Get all leagues
- `GET /api/content` - Get all news
- `GET /api/highlights` - Get all highlights
- `GET /api/feed/all` - Get mixed feed
- `GET /api/feed/club/:id` - Get club-specific feed
- `POST /api/reactions` - Add reaction
- `GET /api/reactions/:type/:id/counts` - Get reaction counts

### Admin Endpoints (Auth Required)

- `POST /api/admin/content` - Create news
- `POST /api/admin/highlights` - Create highlight
- `POST /api/admin/clubs` - Create club
- `POST /api/admin/leagues` - Create league

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

## Project Structure

```
.
├── cmd/
│   └── server/
│       └── main.go          # Application entry point
├── internal/
│   ├── auth/                # Authentication logic
│   ├── config/              # Configuration and Firebase keys
│   ├── db/                  # Database connection
│   ├── handlers/            # HTTP request handlers
│   ├── middleware/          # Auth and admin middleware
│   ├── models/              # Data models
│   ├── notification/        # FCM push notifications
│   └── repository/          # Database operations
├── pkg/
│   └── worker/              # Background worker for async tasks
├── .env.example             # Environment variables template
├── go.mod                   # Go module dependencies
└── README.md                # This file
```

## Deployment

See `DEPLOYMENT_GUIDE.md` for production deployment instructions.

## License

Proprietary - All rights reserved
