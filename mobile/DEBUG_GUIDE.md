# Debug Guide - Club Loading Issue

## Console Logs Added

I've added detailed console logging with emojis to track the flow:

- 🟢 = ClubSelectionScreen logs
- 🔵 = ClubService logs  
- 🟡 = Club model parsing logs
- ❌ = Error logs

## What to Look For

When you run the app and reach the club selection screen, check the console for:

### 1. Network Request
```
🔵 ClubService: Starting to fetch clubs...
🔵 ClubService: URL = http://localhost:8080/api/clubs
🔵 ClubService: No token provided, trying without auth
```

### 2. Response Status
```
🔵 ClubService: Response status code = 200
🔵 ClubService: Response body = [{"id":"...","name":"..."}]
```

### 3. Parsing
```
🟡 Club.fromJson: Parsing club data...
🟡 Club.fromJson: Raw JSON = {id: ..., name: ...}
🟡 Club.fromJson: Parsed club = Arsenal FC (6993686bb2702c6a00284d2e)
```

### 4. Success
```
🔵 ClubService: Successfully parsed 20 clubs
🟢 ClubSelectionScreen: Received 20 clubs
🟢 ClubSelectionScreen: State updated successfully
```

## Common Issues to Check

### Issue 1: Connection Refused
If you see:
```
❌ ClubService: Exception occurred = SocketException: Connection refused
```

**Solution:** 
- Make sure backend is running on `localhost:8080`
- If using Android emulator, change URL to `http://10.0.2.2:8080/api`
- If using iOS simulator, `localhost` should work

### Issue 2: 401 Unauthorized
If you see:
```
🔵 ClubService: Response status code = 401
```

**Solution:**
- The `/api/clubs` endpoint requires authentication
- We need to either:
  1. Make the endpoint public (recommended for registration)
  2. Or register user first without club, then update club later

### Issue 3: CORS Error (Web)
If running on web and see CORS error:

**Solution:**
- Backend needs to allow CORS from Flutter web origin
- Or test on mobile/emulator instead

### Issue 4: Wrong URL Format
If you see parsing errors:

**Solution:**
- Check if backend returns array directly or wrapped in object
- Current code expects: `[{id, name, logo_url, league_id}, ...]`

## Testing Steps

1. Start your backend:
```bash
# Make sure it's running on port 8080
```

2. Run Flutter app with console visible:
```bash
flutter run
```

3. Navigate to club selection screen

4. Watch the console output

5. Share the console logs with me and we'll fix it together!

## Quick Fix for Android Emulator

If using Android emulator, update `lib/config/constants.dart`:

```dart
class AppConstants {
  static const String baseUrl = 'http://10.0.2.2:8080/api';
}
```

## Quick Fix for iOS Simulator

iOS simulator should work with localhost, but if not:

```dart
class AppConstants {
  static const String baseUrl = 'http://127.0.0.1:8080/api';
}
```
