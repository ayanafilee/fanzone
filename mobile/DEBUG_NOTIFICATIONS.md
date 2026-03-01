# Debug Notifications - Step by Step

## Problem: Notifications Not Displaying

Let's debug this systematically.

## Step 1: Verify App Setup

### Check 1: Dependencies Installed
```bash
flutter pub get
```

Look for:
```
✓ firebase_messaging
✓ flutter_local_notifications
✓ http
```

### Check 2: Rebuild App
```bash
flutter clean
flutter run
```

### Check 3: App Starts Successfully
Look for in console:
```
📱 FCM Token: [your-token]
✅ Subscribed to topic: all_users
✅ Subscribed to topic: club_[club_id]
```

**If you don't see FCM token, Firebase is not initialized properly.**

## Step 2: Test Notification Reception

### Send Test Notification from Backend

Use this exact payload:
```json
{
  "topic": "club_69936a49b2702c6a00284d48",
  "notification": {
    "title": "DEBUG TEST",
    "body": "Testing notification display"
  },
  "data": {
    "type": "highlight",
    "highlight_id": "test123"
  }
}
```

### What to Look For in Console

#### If Notification is Received:
```
📬 Foreground message received!
📬 Title: DEBUG TEST
📬 Body: Testing notification display
📬 Data: {type: highlight, highlight_id: test123}
```

**✅ If you see this, notification is reaching the app!**

#### If Notification is NOT Received:
```
[No logs at all]
```

**❌ Problem: Notification not reaching app**

**Possible causes:**
1. Wrong topic subscription
2. FCM token not registered
3. Backend not sending correctly
4. Network issue

## Step 3: Test Notification Display

### If Notification is Received (Step 2 passed)

Look for these logs:
```
🔔 Showing local notification: DEBUG TEST
🔔 Notification data: {type: highlight, ...}
📸 Image URL: null
ℹ️ No valid image URL provided, showing text-only notification
🎯 Created 2 notification actions
✅ Local notification displayed successfully
```

**✅ If you see "Local notification displayed successfully", notification should appear!**

### If You See Errors

#### Error: "No notification payload found"
```
⚠️ No notification payload found
```

**Fix:** Backend must include `notification` field:
```json
{
  "notification": {
    "title": "...",
    "body": "..."
  }
}
```

#### Error: Image loading failed
```
⚠️ Error loading notification image: [error]
```

**This is OK!** Notification will still show without image.

#### Error: No actions created
```
🎯 Created 0 notification actions
```

**Fix:** Ensure `type` field is set to "highlight" or "news"

## Step 4: Check Device Permissions

### Android Settings
1. Open device Settings
2. Go to Apps → FanZone
3. Check Notifications → Should be ON
4. Check "Show notifications" → Should be ON

### Test Permission in App
Add this to your app temporarily:
```dart
final status = await Permission.notification.status;
print('🔔 Notification permission: $status');
```

## Step 5: Test Different App States

### Test 1: Foreground (App Open)
1. Keep app open
2. Send notification
3. Should see notification banner at top

**Expected logs:**
```
📬 Foreground message received!
🔔 Showing local notification
✅ Local notification displayed successfully
```

### Test 2: Background (App Minimized)
1. Press home button (minimize app)
2. Send notification
3. Should see system notification

**Expected:** System notification appears automatically

### Test 3: Terminated (App Closed)
1. Swipe app away (close completely)
2. Send notification
3. Should see system notification

**Expected:** System notification appears automatically

## Step 6: Verify Topic Subscription

### Check Subscribed Topics

Look for these logs when app starts:
```
🔔 Subscribing to club notifications for club ID: 69936a49b2702c6a00284d48
🔔 Topic name: club_69936a49b2702c6a00284d48
✅ Subscribed to topic: club_69936a49b2702c6a00284d48
```

### Verify Topic Matches Backend

**Backend sends to:** `club_69936a49b2702c6a00284d48`
**App subscribes to:** `club_69936a49b2702c6a00284d48`

**These MUST match exactly!**

### Test with "all_users" Topic

Send notification to `all_users` topic:
```json
{
  "topic": "all_users",
  "notification": {
    "title": "Test All Users",
    "body": "This should reach everyone"
  },
  "data": {
    "type": "highlight"
  }
}
```

**If this works but club topic doesn't, problem is with club subscription.**

## Step 7: Test with Firebase Console

### Direct Test (Bypass Backend)

1. Go to Firebase Console
2. Cloud Messaging → Send test message
3. Enter your FCM token (from console logs)
4. Send notification

**If this works:**
- ✅ App setup is correct
- ❌ Problem is with backend sending

**If this doesn't work:**
- ❌ Problem is with app setup
- Check permissions
- Check Firebase initialization

## Step 8: Check Notification Channel

### Verify Channel Creation

Look for this log when app starts:
```
[No specific log, but should not error]
```

### Test Channel Manually

Add this code temporarily:
```dart
final channels = await _localNotifications
    .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
    ?.getNotificationChannels();
    
print('📢 Notification channels: $channels');
```

Should see:
```
📢 Notification channels: [fanzone_channel]
```

## Common Issues & Solutions

### Issue 1: No Logs at All

**Problem:** Notification not reaching app

**Solutions:**
1. Check internet connection
2. Verify FCM token is valid
3. Check topic subscription
4. Test with Firebase Console

### Issue 2: Logs Show "Received" but No Display

**Problem:** Notification received but not displayed

**Solutions:**
1. Check notification permissions
2. Verify notification channel created
3. Check for errors in logs
4. Try uninstall/reinstall app

### Issue 3: Works in Background, Not Foreground

**Problem:** flutter_local_notifications not working

**Solutions:**
1. Verify package installed: `flutter pub get`
2. Check initialization code
3. Rebuild app: `flutter clean && flutter run`

### Issue 4: Image Not Loading

**Problem:** Image URL invalid or inaccessible

**Solutions:**
1. Check image URL is valid
2. Verify URL uses HTTPS
3. Test URL in browser
4. Check image size (< 1MB recommended)

**Note:** Notification will still show without image!

## Quick Checklist

- [ ] `flutter pub get` completed
- [ ] App rebuilt with `flutter clean && flutter run`
- [ ] FCM token appears in console
- [ ] Topic subscription confirmed in console
- [ ] Notification permission granted on device
- [ ] Test notification sent from backend
- [ ] Console shows "Foreground message received"
- [ ] Console shows "Local notification displayed successfully"
- [ ] Notification appears on device

## Still Not Working?

### Collect Debug Info

1. **FCM Token:**
   ```
   📱 FCM Token: [copy this]
   ```

2. **Subscribed Topics:**
   ```
   ✅ Subscribed to topic: [copy this]
   ```

3. **Console Logs:**
   ```
   [Copy all logs when notification is sent]
   ```

4. **Backend Payload:**
   ```json
   [Copy exact JSON sent from backend]
   ```

5. **Device Info:**
   - Android version: ?
   - App state when tested: Foreground/Background/Terminated
   - Notification permission: Granted/Denied

### Test Payload

Use this minimal payload to test:
```json
{
  "topic": "all_users",
  "notification": {
    "title": "MINIMAL TEST",
    "body": "If you see this, basic notifications work"
  },
  "data": {
    "type": "highlight",
    "highlight_id": "test"
  }
}
```

**If this works, problem is with your full payload.**
**If this doesn't work, problem is with app setup.**

## Success Criteria

When everything works, you should see:

### Console Output
```
📬 Foreground message received!
📬 Title: New Match Highlight
📬 Body: NEWCASTLE 2-3 EVERTON
📬 Data: {type: highlight, ...}
🔔 Showing local notification: New Match Highlight
🔔 Notification data: {type: highlight, ...}
📸 Image URL: https://...
📸 Loading notification image: https://...
✅ Image loaded successfully
🎯 Created 3 notification actions
✅ Local notification displayed successfully
```

### Device Display
- Notification banner appears at top
- Shows title and body
- Shows preview image (if provided)
- Can swipe down to see actions
- Actions work when tapped

---

Follow these steps in order and note where it fails. That will pinpoint the exact issue!
