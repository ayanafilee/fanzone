# Testing Guide

## Backend Response Verified

Your backend returns clubs in this format:
```json
{
  "id": "6993683fb2702c6a00284d2c",
  "name": "AFC Bournemouth",
  "logo_url": "https://res.cloudinary.com/...",
  "league_id": "699367cfb2702c6a00284d28"
}
```

✅ The app is now configured to handle this exact structure.

## Testing Steps

### 1. Start Your Backend
```bash
# Make sure your backend is running on localhost:8080
```

### 2. Run the Flutter App
```bash
flutter pub get
flutter run
```

### 3. Test Registration Flow

1. **Splash Screen** → Should show for 2 seconds
2. **Login Screen** → Click "Sign up"
3. **Sign Up Screen**:
   - First name: John
   - Last name: Doe
   - Email: test@example.com
   - Password: password123
   - Click "Continue"

4. **Language Selection**:
   - Select "English" (or Amharic/Afaan Oromo)
   - Click "Continue"

5. **Club Selection**:
   - Should load 20 Premier League clubs
   - Logos should display from Cloudinary
   - Select any club (e.g., Arsenal FC, Manchester United)
   - Click "Complete Registration"

6. **Success** → Should auto-login and show My Club screen

### 4. Test Login Flow

1. Logout from My Club screen
2. Enter same credentials
3. Should login successfully

## Expected Club Display

The app will show all 20 clubs in a 2-column grid:
- AFC Bournemouth
- Arsenal FC (appears twice in your data)
- Brentford FC
- Brighton & Hove Albion
- And 16 more...

Each club card shows:
- Club logo (from Cloudinary)
- Club name
- Orange border when selected

## Troubleshooting

### Clubs Not Loading
- Check if `/api/clubs` endpoint requires authentication
- If yes, you may need to make it public for registration
- Or implement a different flow

### Images Not Showing
- Check internet connection
- Cloudinary URLs should work directly
- Fallback soccer icon will show if image fails

### Registration Fails
- Check backend logs
- Verify all required fields are sent
- Check email doesn't already exist

## API Calls Made

1. `GET /api/clubs` - Fetch clubs (during registration)
2. `POST /api/auth/register` - Create account
3. `POST /api/auth/login` - Auto-login after registration
