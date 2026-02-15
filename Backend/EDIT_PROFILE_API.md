# User Edit Profile API Documentation

This document describes the user profile editing functionality, including updating profile information, changing passwords, and uploading profile images.

## Overview

The edit profile feature allows authenticated users to:
1. Update their profile information (name, language, favorite club, profile image)
2. Change their password securely
3. Upload/update their profile image URL (typically from Cloudinary or similar service)

## API Endpoints

### 1. Get User Profile

**Endpoint:** `GET /api/user/profile`

**Authentication:** Required (JWT Bearer Token)

**Description:** Retrieves the authenticated user's profile information.

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "profile_image_url": "https://cloudinary.com/image.jpg",
  "language": "en",
  "fav_club_id": "507f1f77bcf86cd799439012",
  "role": "user",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### 2. Update User Profile

**Endpoint:** `PUT /api/user/profile`

**Authentication:** Required (JWT Bearer Token)

**Description:** Updates the user's profile information. All fields are optional - only send the fields you want to update.

**Request Body:**
```json
{
  "name": "John Smith",
  "language": "en",
  "fav_club_id": "507f1f77bcf86cd799439012",
  "profile_image_url": "https://cloudinary.com/new-image.jpg"
}
```

**Field Descriptions:**
- `name` (string, optional): User's display name
- `language` (string, optional): Preferred language code (e.g., "en", "am", "om")
- `fav_club_id` (string, optional): MongoDB ObjectID of the user's favorite club
- `profile_image_url` (string, optional): URL to the user's profile image

**Success Response (200 OK):**
```json
{
  "message": "Profile updated successfully"
}
```

**Error Responses:**

- **400 Bad Request** - Invalid input or no fields to update
```json
{
  "error": "No fields to update"
}
```

- **400 Bad Request** - Invalid club ID format
```json
{
  "error": "Invalid club ID"
}
```

- **401 Unauthorized** - Missing or invalid authentication token
```json
{
  "error": "Unauthorized"
}
```

- **500 Internal Server Error** - Database error
```json
{
  "error": "Update failed"
}
```

---

### 3. Update Password

**Endpoint:** `PUT /api/user/password`

**Authentication:** Required (JWT Bearer Token)

**Description:** Changes the user's password. Requires the current password for verification.

**Request Body:**
```json
{
  "current_password": "oldPassword123",
  "new_password": "newPassword456"
}
```

**Field Descriptions:**
- `current_password` (string, required): The user's current password
- `new_password` (string, required): The new password (minimum 6 characters)

**Success Response (200 OK):**
```json
{
  "message": "Password updated successfully"
}
```

**Error Responses:**

- **400 Bad Request** - Missing required fields or password too short
```json
{
  "error": "Key: 'new_password' Error:Field validation for 'new_password' failed on the 'min' tag"
}
```

- **401 Unauthorized** - Current password is incorrect
```json
{
  "error": "Current password is incorrect"
}
```

- **404 Not Found** - User not found
```json
{
  "error": "User not found"
}
```

- **500 Internal Server Error** - Failed to hash or update password
```json
{
  "error": "Failed to update password"
}
```

---

## Usage Examples

### Example 1: Update Profile Name and Language

```bash
curl -X PUT http://localhost:8080/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "language": "am"
  }'
```

### Example 2: Update Profile Image

```bash
curl -X PUT http://localhost:8080/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "profile_image_url": "https://res.cloudinary.com/demo/image/upload/v1234567890/profile.jpg"
  }'
```

### Example 3: Update Favorite Club

```bash
curl -X PUT http://localhost:8080/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fav_club_id": "507f1f77bcf86cd799439012"
  }'
```

### Example 4: Change Password

```bash
curl -X PUT http://localhost:8080/api/user/password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "myOldPassword",
    "new_password": "myNewSecurePassword123"
  }'
```

---

## Frontend Integration Guide

### JavaScript/TypeScript Example

```javascript
// Update profile information
async function updateProfile(profileData) {
  const response = await fetch('http://localhost:8080/api/user/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData)
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error);
  }
  
  return data;
}

// Update password
async function updatePassword(currentPassword, newPassword) {
  const response = await fetch('http://localhost:8080/api/user/password', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword
    })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error);
  }
  
  return data;
}

// Upload image to Cloudinary and update profile
async function uploadProfileImage(file) {
  // 1. Upload to Cloudinary
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'YOUR_UPLOAD_PRESET');
  
  const cloudinaryResponse = await fetch(
    'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload',
    {
      method: 'POST',
      body: formData
    }
  );
  
  const cloudinaryData = await cloudinaryResponse.json();
  
  // 2. Update profile with new image URL
  return await updateProfile({
    profile_image_url: cloudinaryData.secure_url
  });
}
```

---

## Security Considerations

1. **Password Updates:**
   - Current password verification is required before changing password
   - New passwords must be at least 6 characters long
   - Passwords are hashed using bcrypt before storage
   - Password field is never returned in API responses

2. **Authentication:**
   - All endpoints require valid JWT authentication
   - Users can only update their own profile
   - User ID is extracted from the JWT token, not from request body

3. **Input Validation:**
   - All inputs are validated before processing
   - Invalid ObjectIDs are rejected
   - Empty update requests are rejected

---

## Database Schema Changes

The `User` model has been updated to include a new field:

```go
type User struct {
    ID              bson.ObjectID `bson:"_id,omitempty" json:"id"`
    Name            string        `bson:"name" json:"name"`
    Email           string        `bson:"email" json:"email"`
    Password        string        `bson:"password" json:"-"`
    ProfileImageURL string        `bson:"profile_image_url,omitempty" json:"profile_image_url,omitempty"` // NEW
    Language        string        `bson:"language" json:"language"`
    FavClubID       bson.ObjectID `bson:"fav_club_id,omitempty" json:"fav_club_id"`
    Role            string        `bson:"role" json:"role"`
    CreatedAt       time.Time     `bson:"created_at" json:"created_at"`
}
```

**Note:** Existing users in the database will have an empty `profile_image_url` field by default. This is handled gracefully with the `omitempty` tag.

---

## Testing

### Manual Testing Checklist

- [ ] Get user profile returns correct data
- [ ] Update profile name successfully
- [ ] Update profile language successfully
- [ ] Update favorite club with valid club ID
- [ ] Update profile image URL successfully
- [ ] Update multiple fields at once
- [ ] Reject update with invalid club ID
- [ ] Reject update with no fields
- [ ] Change password with correct current password
- [ ] Reject password change with incorrect current password
- [ ] Reject password change with short new password (< 6 chars)
- [ ] Verify password is hashed in database
- [ ] Verify password is not returned in profile response

---

## Common Issues and Solutions

### Issue: "Invalid club ID" error
**Solution:** Ensure the `fav_club_id` is a valid MongoDB ObjectID (24 hex characters)

### Issue: "Current password is incorrect"
**Solution:** Verify the user is entering their correct current password

### Issue: "No fields to update"
**Solution:** Ensure at least one valid field is included in the request body

### Issue: Profile image not displaying
**Solution:** Verify the `profile_image_url` is a valid, publicly accessible URL

---

## Future Enhancements

Potential improvements for future versions:

1. **Email Change:** Add endpoint to change user email with verification
2. **Image Upload:** Direct image upload instead of URL (integrate with Cloudinary SDK)
3. **Profile Validation:** Add more robust validation for profile fields
4. **Password Requirements:** Enforce stronger password policies
5. **Activity Log:** Track profile changes for security audit
6. **Profile Completeness:** Add indicator for profile completion percentage
