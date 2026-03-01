# Notification Fix Guide

## What Was Changed

### 1. Added flutter_local_notifications Package
- Added `flutter_local_notifications: ^17.0.0` to pubspec.yaml
- This package is required to display notifications when the app is in the foreground

### 2. Enhanced NotificationService
Updated `lib/services/notification_service.dart` with:
- Local notification initialization
- Android notification channel creation
- Foreground notification display
- Proper notification handling for all app states

## Steps to Fix Notifications

### Step 1: Install Dependencies
```bash
flutter pub get
```

### Step 2: Rebuild the App
```bash
# Clean build
flutter clean

# Rebuild and install
flutter run
```

### Step 3: Verify Subscriptions
When the app starts, check the console logs for:
```
✅ Subscribed to topic: all_users
✅ Subscribed to topic: club_69936a49b2702c6a00284d48
```

### Step 4: Test Notification
1. Keep the app open (foreground)
2. Send a notification from the admin panel
3. You should see console logs:
   ```
   📬 Foreground message received!
   📬 Title: New Match Highlight
   📬 Body: NEWCASTLE 2-3 EVERTON...
   🔔 Showing local notification: New Match Highlight
   ✅ Local notification displayed successfully
   ```

## Troubleshooting Checklist

### ✅ Backend is Sending (Already Working)
From your logs, the backend is successfully sending:
```
✅ [FCM SUCCESS] Message sent successfully to topic club_69936a49b2702c6a00284d48
```

### ✅ Check Device Permissions
1. Go to device Settings → Apps → FanZone
2. Enable "Notifications" permission
3. For Android 13+, this must be explicitly granted

### ✅ Check Topic Subscription
Run this command to see subscriptions:
```bash
flutter run --verbose
```
Look for:
```
📱 FCM Token: [your-token]
✅ Subscribed to topic: club_[club_id]
```

### ✅ Verify Club ID Match
Your backend sent to: `club_69936a49b2702c6a00284d48`
Make sure your app subscribed to the same topic.

Check in home_screen.dart logs when app starts:
```dart
print('Subscribing to club: $favClubId');
```

### ✅ Test Different App States

#### Foreground (App Open)
- Should show notification via flutter_local_notifications
- Check console for "🔔 Showing local notification"

#### Background (App Minimized)
- Android system shows notification automatically
- Tap notification to open app

#### Terminated (App Closed)
- Android system shows notification automatically
- Tap notification to launch app

## Common Issues & Solutions

### Issue 1: No Notification in Foreground
**Solution:** This is why we added flutter_local_notifications
- The new code explicitly shows notifications when app is open
- Rebuild the app after running `flutter pub get`

### Issue 2: Wrong Topic Subscription
**Problem:** App subscribed to different club than backend sent to

**Solution:** 
1. Open settings in app
2. Change club and save
3. Check logs for unsubscribe/subscribe messages:
   ```
   ❌ Unsubscribed from topic: club_[old_id]
   ✅ Subscribed to topic: club_[new_id]
   ```

### Issue 3: Permissions Not Granted
**Solution:**
1. Uninstall the app completely
2. Reinstall: `flutter run`
3. Grant notification permission when prompted
4. Or manually enable in device settings

### Issue 4: Firebase Configuration
**Check:**
1. `google-services.json` is in `android/app/`
2. Package name matches in Firebase Console
3. SHA-1 fingerprint is added (for release builds)

## Testing Commands

### Get FCM Token
Add this to your app and check logs:
```dart
final token = await NotificationService().getToken();
print('🔑 My FCM Token: $token');
```

### Manual Topic Subscription Test
```dart
await NotificationService().subscribeToTopic('test_topic');
```

Then send a test notification to `test_topic` from Firebase Console.

### Check Subscribed Topics
Unfortunately, FCM doesn't provide an API to list subscribed topics.
You must track them in your app logs.

## Quick Test Steps

1. **Rebuild App:**
   ```bash
   flutter clean
   flutter pub get
   flutter run
   ```

2. **Check Console for:**
   - FCM Token printed
   - Topic subscriptions confirmed
   - No errors during initialization

3. **Select Newcastle United in App**
   - Go to Settings
   - Select Newcastle United
   - Save changes
   - Check logs for: `✅ Subscribed to topic: club_69936a49b2702c6a00284d48`

4. **Send Notification from Admin Panel**
   - Create a highlight with Newcastle United
   - Keep app in FOREGROUND
   - Should see notification appear

5. **Test Background:**
   - Minimize app (press home button)
   - Send another notification
   - Should see system notification

## Expected Console Output

When everything works correctly:
```
📱 FCM Token: [token]
✅ Subscribed to topic: all_users
✅ Subscribed to topic: club_69936a49b2702c6a00284d48
📬 Foreground message received!
📬 Title: New Match Highlight
📬 Body: NEWCASTLE 2-3 EVERTON | Premier League highlights
📬 Data: {type: highlight, highlight_id: 69a4037104d8e22f86405b98, ...}
🔔 Showing local notification: New Match Highlight
✅ Local notification displayed successfully
```

## Still Not Working?

### Debug Steps:
1. Print the FCM token and verify it's not null
2. Manually test with Firebase Console:
   - Go to Firebase Console → Cloud Messaging
   - Send test message to your device token
   - If this works, issue is with topic subscription
   - If this doesn't work, issue is with device/permissions

3. Check if notifications work from Firebase Console:
   - Firebase Console → Cloud Messaging → Send test message
   - Enter your FCM token
   - If you receive this, your device setup is correct
   - Problem is with topic subscription in app

4. Verify topic format:
   - Backend sends to: `club_69936a49b2702c6a00284d48`
   - App subscribes to: `club_69936a49b2702c6a00284d48`
   - These MUST match exactly (case-sensitive)
