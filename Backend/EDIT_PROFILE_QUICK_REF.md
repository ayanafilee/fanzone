# Edit Profile - Quick Reference

## 🚀 Quick Start

### Available Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/user/profile` | Get user profile | ✅ Yes |
| PUT | `/api/user/profile` | Update profile info | ✅ Yes |
| PUT | `/api/user/password` | Change password | ✅ Yes |

---

## 📝 Update Profile

**Endpoint:** `PUT /api/user/profile`

**Request Body (all fields optional):**
```json
{
  "name": "string",
  "language": "string",
  "fav_club_id": "string (MongoDB ObjectID)",
  "profile_image_url": "string (URL)"
}
```

**Example:**
```bash
curl -X PUT http://localhost:8080/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "profile_image_url": "https://example.com/image.jpg"}'
```

---

## 🔐 Change Password

**Endpoint:** `PUT /api/user/password`

**Request Body:**
```json
{
  "current_password": "string (required)",
  "new_password": "string (required, min 6 chars)"
}
```

**Example:**
```bash
curl -X PUT http://localhost:8080/api/user/password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"current_password": "old123", "new_password": "new456"}'
```

---

## 🖼️ Upload Profile Image Workflow

### Option 1: Using Cloudinary

```javascript
// 1. Upload to Cloudinary
const formData = new FormData();
formData.append('file', imageFile);
formData.append('upload_preset', 'YOUR_PRESET');

const cloudinaryRes = await fetch(
  'https://api.cloudinary.com/v1_1/YOUR_CLOUD/image/upload',
  { method: 'POST', body: formData }
);
const { secure_url } = await cloudinaryRes.json();

// 2. Update profile with image URL
await fetch('http://localhost:8080/api/user/profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ profile_image_url: secure_url })
});
```

### Option 2: Direct URL

If you already have an image URL:

```javascript
await fetch('http://localhost:8080/api/user/profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ 
    profile_image_url: 'https://example.com/my-image.jpg' 
  })
});
```

---

## ✅ Success Responses

All successful updates return:
```json
{
  "message": "Profile updated successfully"
}
```
or
```json
{
  "message": "Password updated successfully"
}
```

---

## ❌ Common Errors

| Status | Error | Cause |
|--------|-------|-------|
| 400 | "No fields to update" | Empty request body |
| 400 | "Invalid club ID" | Invalid MongoDB ObjectID |
| 400 | Validation error | Password too short or missing fields |
| 401 | "Current password is incorrect" | Wrong current password |
| 401 | "Unauthorized" | Missing or invalid token |
| 404 | "User not found" | User doesn't exist |
| 500 | "Update failed" | Database error |

---

## 🔑 Authentication

All endpoints require JWT Bearer token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get token from login:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

---

## 📱 Mobile App Integration (React Native Example)

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update profile
const updateProfile = async (profileData) => {
  const token = await AsyncStorage.getItem('access_token');
  
  const response = await fetch('http://YOUR_API/api/user/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData)
  });
  
  return await response.json();
};

// Change password
const changePassword = async (currentPassword, newPassword) => {
  const token = await AsyncStorage.getItem('access_token');
  
  const response = await fetch('http://YOUR_API/api/user/password', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword
    })
  });
  
  return await response.json();
};
```

---

## 🧪 Testing Checklist

- [ ] Get profile returns user data
- [ ] Update name successfully
- [ ] Update language successfully
- [ ] Update favorite club successfully
- [ ] Update profile image URL successfully
- [ ] Update multiple fields at once
- [ ] Change password with correct current password
- [ ] Reject password change with wrong current password
- [ ] Reject password change with short password
- [ ] Reject update with invalid club ID
- [ ] Reject update with no fields
- [ ] Reject requests without authentication

---

## 📚 Full Documentation

For complete details, see:
- **EDIT_PROFILE_API.md** - Complete API documentation
- **EDIT_PROFILE_TESTING.md** - Detailed testing guide
- **EDIT_PROFILE_SUMMARY.md** - Implementation summary

---

## 🛠️ Development

### Run Server
```bash
cd d:\projects\FanZone\Backend
go run cmd/server/main.go
```

### Build
```bash
go build ./cmd/server
```

### Test
```bash
go test ./...
```

---

**Last Updated:** February 14, 2026
