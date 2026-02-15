# Edit Profile - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  (Mobile App / Web Frontend / API Client)                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP Requests with JWT Token
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                      API Gateway (Gin)                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  CORS Middleware                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                   Auth Middleware                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  - Validate JWT Token                                     │  │
│  │  - Extract User ID                                        │  │
│  │  - Set User Context                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    Route Handlers                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  GET  /api/user/profile      → GetProfile()             │  │
│  │  PUT  /api/user/profile      → UpdateProfile()          │  │
│  │  PUT  /api/user/password     → UpdatePassword()         │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                  Handler Functions                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  UpdateProfile():                                         │  │
│  │    1. Extract user ID from context                       │  │
│  │    2. Parse request body                                 │  │
│  │    3. Validate inputs                                    │  │
│  │    4. Build update map                                   │  │
│  │    5. Call repository                                    │  │
│  │                                                           │  │
│  │  UpdatePassword():                                        │  │
│  │    1. Extract user ID from context                       │  │
│  │    2. Parse request body                                 │  │
│  │    3. Fetch current user                                 │  │
│  │    4. Verify current password (bcrypt)                   │  │
│  │    5. Hash new password (bcrypt)                         │  │
│  │    6. Call repository                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    Repository Layer                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  FindUserByID(ctx, id)                                    │  │
│  │  UpdateUser(ctx, id, updateFields)                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    MongoDB Database                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Collection: users                                        │  │
│  │  {                                                        │  │
│  │    _id: ObjectID,                                        │  │
│  │    name: string,                                         │  │
│  │    email: string,                                        │  │
│  │    password: string (hashed),                            │  │
│  │    profile_image_url: string,  ← NEW FIELD              │  │
│  │    language: string,                                     │  │
│  │    fav_club_id: ObjectID,                                │  │
│  │    role: string,                                         │  │
│  │    created_at: timestamp                                 │  │
│  │  }                                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### Update Profile Flow

```
Client                Handler              Repository           Database
  │                      │                      │                   │
  │  PUT /profile        │                      │                   │
  │  + JWT Token         │                      │                   │
  │─────────────────────>│                      │                   │
  │                      │                      │                   │
  │                      │  Validate Token      │                   │
  │                      │  Extract User ID     │                   │
  │                      │                      │                   │
  │                      │  Parse Request       │                   │
  │                      │  Validate Fields     │                   │
  │                      │                      │                   │
  │                      │  UpdateUser(id, data)│                   │
  │                      │─────────────────────>│                   │
  │                      │                      │                   │
  │                      │                      │  $set: {fields}   │
  │                      │                      │──────────────────>│
  │                      │                      │                   │
  │                      │                      │  Success          │
  │                      │                      │<──────────────────│
  │                      │                      │                   │
  │                      │  Success             │                   │
  │                      │<─────────────────────│                   │
  │                      │                      │                   │
  │  200 OK              │                      │                   │
  │  {message: success}  │                      │                   │
  │<─────────────────────│                      │                   │
  │                      │                      │                   │
```

### Update Password Flow

```
Client                Handler              Repository           Database
  │                      │                      │                   │
  │  PUT /password       │                      │                   │
  │  + JWT Token         │                      │                   │
  │  + current_password  │                      │                   │
  │  + new_password      │                      │                   │
  │─────────────────────>│                      │                   │
  │                      │                      │                   │
  │                      │  Validate Token      │                   │
  │                      │  Extract User ID     │                   │
  │                      │                      │                   │
  │                      │  FindUserByID(id)    │                   │
  │                      │─────────────────────>│                   │
  │                      │                      │                   │
  │                      │                      │  Find User        │
  │                      │                      │──────────────────>│
  │                      │                      │                   │
  │                      │                      │  User Data        │
  │                      │                      │<──────────────────│
  │                      │                      │                   │
  │                      │  User Data           │                   │
  │                      │<─────────────────────│                   │
  │                      │                      │                   │
  │                      │  bcrypt.Compare      │                   │
  │                      │  (verify password)   │                   │
  │                      │                      │                   │
  │                      │  ✓ Password Valid    │                   │
  │                      │                      │                   │
  │                      │  bcrypt.Hash         │                   │
  │                      │  (new password)      │                   │
  │                      │                      │                   │
  │                      │  UpdateUser(id, pwd) │                   │
  │                      │─────────────────────>│                   │
  │                      │                      │                   │
  │                      │                      │  $set: {password} │
  │                      │                      │──────────────────>│
  │                      │                      │                   │
  │                      │                      │  Success          │
  │                      │                      │<──────────────────│
  │                      │                      │                   │
  │                      │  Success             │                   │
  │                      │<─────────────────────│                   │
  │                      │                      │                   │
  │  200 OK              │                      │                   │
  │  {message: success}  │                      │                   │
  │<─────────────────────│                      │                   │
  │                      │                      │                   │
```

### Profile Image Upload Flow (with Cloudinary)

```
Client              Cloudinary           Backend API         Database
  │                      │                      │                 │
  │  Upload Image        │                      │                 │
  │─────────────────────>│                      │                 │
  │                      │                      │                 │
  │                      │  Process & Store     │                 │
  │                      │                      │                 │
  │  Image URL           │                      │                 │
  │<─────────────────────│                      │                 │
  │                      │                      │                 │
  │  PUT /profile                               │                 │
  │  {profile_image_url: "https://..."}         │                 │
  │────────────────────────────────────────────>│                 │
  │                      │                      │                 │
  │                      │                      │  Update User    │
  │                      │                      │────────────────>│
  │                      │                      │                 │
  │                      │                      │  Success        │
  │                      │                      │<────────────────│
  │                      │                      │                 │
  │  200 OK                                     │                 │
  │<────────────────────────────────────────────│                 │
  │                      │                      │                 │
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│  Layer 1: HTTPS/TLS Encryption                                  │
│  - Encrypts all data in transit                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 2: CORS Protection                                       │
│  - Controls which origins can access the API                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 3: JWT Authentication                                    │
│  - Validates user identity                                      │
│  - Ensures user is logged in                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 4: User Isolation                                        │
│  - User ID from JWT (not from request)                          │
│  - Users can only modify their own data                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 5: Input Validation                                      │
│  - Validates all input fields                                   │
│  - Checks data types and formats                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 6: Password Verification (for password changes)          │
│  - Requires current password                                    │
│  - Uses bcrypt for comparison                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 7: Password Hashing                                      │
│  - Bcrypt with default cost (10)                                │
│  - Never stores plain text passwords                            │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
FanZone/Backend/
│
├── cmd/
│   └── server/
│       └── main.go                    ← Route definitions
│
├── internal/
│   ├── models/
│   │   └── models.go                  ← User model (with profile_image_url)
│   │
│   ├── handlers/
│   │   ├── handler.go                 ← Handler struct
│   │   ├── auth.go                    ← Auth handlers
│   │   ├── user.go                    ← Profile handlers ★ MODIFIED
│   │   ├── admin.go                   ← Admin handlers
│   │   ├── club.go                    ← Club handlers
│   │   └── content.go                 ← Content handlers
│   │
│   ├── repository/
│   │   └── repository.go              ← Database operations
│   │
│   ├── middleware/
│   │   └── auth.go                    ← JWT middleware
│   │
│   └── config/
│       └── config.go                  ← Configuration
│
├── EDIT_PROFILE_API.md                ← Full API documentation
├── EDIT_PROFILE_TESTING.md            ← Testing guide
├── EDIT_PROFILE_SUMMARY.md            ← Implementation summary
├── EDIT_PROFILE_QUICK_REF.md          ← Quick reference
└── EDIT_PROFILE_ARCHITECTURE.md       ← This file
```

## Component Interaction

```
┌──────────────────────────────────────────────────────────────┐
│                         Handler                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  UpdateProfile(c *gin.Context)                         │  │
│  │  UpdatePassword(c *gin.Context)                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                            │                                  │
│                            │ uses                             │
│                            ▼                                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Repository                                            │  │
│  │    - FindUserByID()                                    │  │
│  │    - UpdateUser()                                      │  │
│  └────────────────────────────────────────────────────────┘  │
│                            │                                  │
│                            │ uses                             │
│                            ▼                                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Database (MongoDB)                                    │  │
│  │    - users collection                                  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
Request
  │
  ├─> JWT Invalid? ──────────────────> 401 Unauthorized
  │
  ├─> Invalid Input? ────────────────> 400 Bad Request
  │
  ├─> User Not Found? ───────────────> 404 Not Found
  │
  ├─> Wrong Password? ───────────────> 401 Unauthorized
  │
  ├─> Database Error? ───────────────> 500 Internal Server Error
  │
  └─> Success ───────────────────────> 200 OK
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Production Environment                                      │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  Load Balancer   │────────>│  Go Server       │         │
│  │  (nginx/AWS ALB) │         │  (Port 8080)     │         │
│  └──────────────────┘         └──────────────────┘         │
│                                        │                     │
│                                        │                     │
│                                        ▼                     │
│                               ┌──────────────────┐          │
│                               │  MongoDB Atlas   │          │
│                               │  (Cloud DB)      │          │
│                               └──────────────────┘          │
│                                                              │
│  External Services:                                         │
│  ┌──────────────────┐                                       │
│  │  Cloudinary      │  (Image hosting)                      │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

---

**Last Updated:** February 14, 2026
