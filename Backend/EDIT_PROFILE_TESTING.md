# Edit Profile API Testing Guide

This file contains example requests for testing the edit profile functionality.

## Prerequisites

1. Start the server: `go run cmd/server/main.go`
2. Register a user and get an access token
3. Replace `YOUR_ACCESS_TOKEN` with your actual JWT token in the examples below

## Test Scenarios

### 1. Get Current Profile

```bash
curl -X GET http://localhost:8080/api/user/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "id": "...",
  "name": "Test User",
  "email": "test@example.com",
  "language": "en",
  "fav_club_id": "...",
  "role": "user",
  "created_at": "..."
}
```

---

### 2. Update Profile Name

```bash
curl -X PUT http://localhost:8080/api/user/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name"
  }'
```

**Expected Response:**
```json
{
  "message": "Profile updated successfully"
}
```

---

### 3. Update Profile Image URL

```bash
curl -X PUT http://localhost:8080/api/user/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "profile_image_url": "https://example.com/profile-image.jpg"
  }'
```

**Expected Response:**
```json
{
  "message": "Profile updated successfully"
}
```

---

### 4. Update Language Preference

```bash
curl -X PUT http://localhost:8080/api/user/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "am"
  }'
```

**Expected Response:**
```json
{
  "message": "Profile updated successfully"
}
```

---

### 5. Update Favorite Club

First, get a list of clubs to find a valid club ID:

```bash
curl -X GET http://localhost:8080/api/clubs \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Then update with a valid club ID:

```bash
curl -X PUT http://localhost:8080/api/user/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fav_club_id": "VALID_CLUB_ID_HERE"
  }'
```

**Expected Response:**
```json
{
  "message": "Profile updated successfully"
}
```

---

### 6. Update Multiple Fields at Once

```bash
curl -X PUT http://localhost:8080/api/user/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "language": "om",
    "profile_image_url": "https://example.com/new-image.jpg"
  }'
```

**Expected Response:**
```json
{
  "message": "Profile updated successfully"
}
```

---

### 7. Change Password (Success)

```bash
curl -X PUT http://localhost:8080/api/user/password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "password123",
    "new_password": "newPassword456"
  }'
```

**Expected Response:**
```json
{
  "message": "Password updated successfully"
}
```

---

### 8. Change Password (Wrong Current Password)

```bash
curl -X PUT http://localhost:8080/api/user/password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "wrongPassword",
    "new_password": "newPassword456"
  }'
```

**Expected Response (401 Unauthorized):**
```json
{
  "error": "Current password is incorrect"
}
```

---

### 9. Change Password (Too Short)

```bash
curl -X PUT http://localhost:8080/api/user/password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "password123",
    "new_password": "123"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Key: 'new_password' Error:Field validation for 'new_password' failed on the 'min' tag"
}
```

---

### 10. Update with Invalid Club ID

```bash
curl -X PUT http://localhost:8080/api/user/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fav_club_id": "invalid-id"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Invalid club ID"
}
```

---

### 11. Update with No Fields

```bash
curl -X PUT http://localhost:8080/api/user/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "No fields to update"
}
```

---

### 12. Update Without Authentication

```bash
curl -X PUT http://localhost:8080/api/user/profile \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test"
  }'
```

**Expected Response (401 Unauthorized):**
```json
{
  "error": "Authorization header required"
}
```

---

## Complete Workflow Test

Here's a complete workflow to test all functionality:

```bash
# 1. Register a new user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "password123",
    "language": "en"
  }'

# 2. Login to get access token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123"
  }'

# Save the access_token from the response

# 3. Get current profile
curl -X GET http://localhost:8080/api/user/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 4. Update profile information
curl -X PUT http://localhost:8080/api/user/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Test User",
    "profile_image_url": "https://example.com/avatar.jpg",
    "language": "am"
  }'

# 5. Verify the update
curl -X GET http://localhost:8080/api/user/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 6. Change password
curl -X PUT http://localhost:8080/api/user/password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "password123",
    "new_password": "newPassword456"
  }'

# 7. Verify password change by logging in with new password
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "newPassword456"
  }'
```

---

## Using Postman

If you prefer using Postman:

1. **Create a new collection** called "FanZone Edit Profile"

2. **Add environment variables:**
   - `base_url`: `http://localhost:8080`
   - `access_token`: (will be set after login)

3. **Import these requests:**

   - **Get Profile**
     - Method: GET
     - URL: `{{base_url}}/api/user/profile`
     - Headers: `Authorization: Bearer {{access_token}}`

   - **Update Profile**
     - Method: PUT
     - URL: `{{base_url}}/api/user/profile`
     - Headers: `Authorization: Bearer {{access_token}}`, `Content-Type: application/json`
     - Body (raw JSON): See examples above

   - **Update Password**
     - Method: PUT
     - URL: `{{base_url}}/api/user/password`
     - Headers: `Authorization: Bearer {{access_token}}`, `Content-Type: application/json`
     - Body (raw JSON): See examples above

4. **Set up a test script** in the Login request to automatically save the access token:
   ```javascript
   var jsonData = pm.response.json();
   pm.environment.set("access_token", jsonData.access_token);
   ```

---

## Notes

- All profile update fields are optional
- Password must be at least 6 characters
- Club IDs must be valid MongoDB ObjectIDs
- Profile image URLs should be publicly accessible
- The server runs on port 8080 by default (check your config)
