# Firebase Cloud Messaging (FCM) Notification Testing Guide

## Prerequisites

Before testing, ensure you have:
1. ✅ Firebase project created
2. ✅ `google-services.json` file in `android/app/`
3. ✅ App installed on a physical Android device (emulators may have issues with FCM)
4. ✅ Internet connection on the device

---

## Step 1: Get Your FCM Token

The FCM token is a unique identifier for your device. You need this to send test notifications.

### Method A: From App Logs (Easiest)

1. **Run the app on your physical device:**
   ```bash
   flutter run
   ```

2. **Look for the FCM token in the console output:**
   - You'll see a line like: `📱 FCM Token: eXaMpLeToKeN123...`
   - Copy this entire token (it's very long, ~150+ characters)

3. **Alternative - Check from Android Studio/VS Code:**
   - Open Logcat (Android Studio) or Debug Console (VS Code)
   - Filter for "FCM Token"
   - Copy the token

### Method B: From Device Logs

1. **Connect your device via USB**
2. **Run:**
   ```bash
   adb logcat | grep "FCM Token"
   ```
3. **Copy the token from the output**

---

## Step 2: Verify Topics Subscription

Your app automatically subscribes users to topics based on their selected club.

### Check Subscribed Topics:

When the app runs, you should see logs like:
```
✅ Subscribed to topic: club_507f1f77bcf86cd799439012
✅ Subscribed to topic: all_news
```

**Topics your app uses:**
- `club_{club_id}` - For user's favorite club notifications
- `all_news` - For general news notifications

---

## Step 3: Send Test Notifications

You have 3 methods to send test notifications:

### Method A: Firebase Console (Easiest for Beginners)

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com
   - Select your project

2. **Navigate to Cloud Messaging:**
   - Click "Engage" → "Messaging" in the left sidebar
   - Click "Create your first campaign" or "New campaign"
   - Select "Firebase Notification messages"

3. **Compose Notification:**
   - **Notification title:** "New Match Highlight!"
   - **Notification text:** "Arsenal vs Chelsea - Full Highlights Available"
   - Click "Next"

4. **Target:**
   - Select "User segment"
   - Choose "All users" OR
   - Select "Topic" and enter: `all_news` or `club_{your_club_id}`
   - Click "Next"

5. **Schedule:**
   - Select "Now"
   - Click "Next"

6. **Additional Options (Optional):**
   - You can add custom data, sound, etc.
   - Click "Review"

7. **Publish:**
   - Click "Publish"
   - Wait 10-30 seconds for the notification to arrive

### Method B: Using FCM Token (For Specific Device)

1. **Go to Firebase Console → Cloud Messaging**
2. **Click "Send test message"**
3. **Paste your FCM token** (from Step 1)
4. **Click "Test"**

### Method C: Using REST API (Advanced - For Backend Testing)

You can use tools like Postman or curl to send notifications.

#### Using curl:

```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "/topics/all_news",
    "notification": {
      "title": "Breaking News!",
      "body": "New transfer announcement",
      "sound": "default"
    },
    "data": {
      "type": "news",
      "id": "123"
    }
  }'
```

**To get your Server Key:**
1. Go to Firebase Console
2. Click the gear icon → Project settings
3. Go to "Cloud Messaging" tab
4. Copy the "Server key"

#### Send to Specific Device:
Replace `"to": "/topics/all_news"` with `"to": "YOUR_FCM_TOKEN"`

#### Send to Topic:
Use `"to": "/topics/club_507f1f77bcf86cd799439012"` for club-specific notifications

---

## Step 4: Test Different Scenarios

### Scenario 1: App in Foreground
1. **Open the app**
2. **Send a notification** (using any method above)
3. **Expected:** Notification appears at the top of the screen (system notification)

### Scenario 2: App in Background
1. **Press home button** (app goes to background)
2. **Send a notification**
3. **Expected:** Notification appears in notification tray
4. **Tap notification** → App should open

### Scenario 3: App Closed
1. **Swipe away the app** (completely close it)
2. **Send a notification**
3. **Expected:** Notification appears in notification tray
4. **Tap notification** → App should launch

### Scenario 4: Topic-Based Notification
1. **Select a club** in the app (e.g., Arsenal)
2. **Note the club_id** from logs
3. **Send notification to topic:** `club_{club_id}`
4. **Expected:** Only users who selected that club receive it

---

## Step 5: Verify Notification Delivery

### Check if notification was received:

1. **Look at device notification tray**
2. **Check app logs for:**
   ```
   📬 Foreground message: Your Title
   📬 Background message: Your Title
   📱 Notification tapped: Your Title
   ```

### Common Issues and Solutions:

#### ❌ No notification received:
- **Check internet connection** on device
- **Verify FCM token** is correct
- **Check Firebase Console** for delivery status
- **Ensure google-services.json** is correct
- **Rebuild the app:** `flutter clean && flutter run`

#### ❌ Notification only works in foreground:
- This is normal! Background notifications are handled by the system
- Make sure you're testing on a physical device, not emulator

#### ❌ Token is null:
- **Check Firebase initialization** in `main.dart`
- **Verify google-services.json** is in the correct location
- **Check permissions** are granted

---

## Step 6: Test Notification Actions

### Test the Notification Bell Icon:

1. **Open the app**
2. **Tap the notification bell icon** in the header
3. **Expected:** Opens notifications screen showing recent feed items

---

## Step 7: Backend Integration (For Your Backend Team)

When you're ready to integrate with your backend:

### Send FCM Token to Backend:

The token is already saved in SharedPreferences. You can retrieve it:

```dart
final prefs = await SharedPreferences.getInstance();
final token = prefs.getString('fcm_token');
// Send this token to your backend API
```

### Backend Should:

1. **Store FCM tokens** for each user
2. **Send notifications** when new content is published:
   - New news article → Send to `all_news` topic
   - New club-specific content → Send to `club_{club_id}` topic
   - User-specific notification → Send to user's FCM token

### Example Backend Notification Payload:

```json
{
  "to": "/topics/club_507f1f77bcf86cd799439012",
  "notification": {
    "title": "Arsenal Match Update",
    "body": "Arsenal vs Chelsea - Match starting in 30 minutes!",
    "sound": "default",
    "badge": "1"
  },
  "data": {
    "type": "news",
    "club_id": "507f1f77bcf86cd799439012",
    "article_id": "abc123",
    "click_action": "FLUTTER_NOTIFICATION_CLICK"
  },
  "priority": "high"
}
```

---

## Quick Testing Checklist

- [ ] App runs successfully on physical device
- [ ] FCM token is printed in logs
- [ ] Topics subscription confirmed in logs
- [ ] Test notification sent from Firebase Console
- [ ] Notification received when app is in foreground
- [ ] Notification received when app is in background
- [ ] Notification received when app is closed
- [ ] Tapping notification opens the app
- [ ] Notification bell icon works in app
- [ ] Different topics tested (all_news, club-specific)

---

## Troubleshooting Commands

### Check if Firebase is properly configured:
```bash
flutter pub get
flutter clean
flutter run
```

### View all logs:
```bash
adb logcat | grep -E "FCM|Firebase|Notification"
```

### Check app permissions:
```bash
adb shell dumpsys package com.example.fanzone | grep permission
```

### Reinstall app (if issues persist):
```bash
flutter clean
adb uninstall com.example.fanzone
flutter run
```

---

## Testing Tips

1. **Always test on a physical device** - Emulators have unreliable FCM support
2. **Keep the app logs open** - They show valuable debugging information
3. **Test all three states** - Foreground, background, and closed
4. **Use topics for testing** - Easier than managing individual tokens
5. **Check Firebase Console** - Shows delivery statistics and errors
6. **Wait 10-30 seconds** - Notifications may take time to arrive
7. **Test with different notification content** - Verify all fields work

---

## Next Steps

Once notifications are working:

1. **Integrate with your backend** - Send tokens to your API
2. **Add notification handling** - Navigate to specific screens based on notification data
3. **Customize notification appearance** - Add icons, colors, sounds
4. **Add notification preferences** - Let users choose which notifications they want
5. **Track notification analytics** - Monitor open rates and engagement

---

## Support

If you encounter issues:
1. Check Firebase Console for error messages
2. Review app logs for FCM-related errors
3. Verify google-services.json matches your Firebase project
4. Ensure package name matches: `com.example.fanzone`
5. Check Firebase project settings for correct SHA-1 fingerprint (if using)

---

**Happy Testing! 🎉**
