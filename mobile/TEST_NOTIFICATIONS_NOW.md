# Test Notifications - Quick Steps

## 🚀 Quick Fix & Test (5 minutes)

### Step 1: Install New Package (30 seconds)
```bash
flutter pub get
```

### Step 2: Rebuild App (2 minutes)
```bash
flutter clean
flutter run
```

### Step 3: Check Console Logs (30 seconds)
After app starts, look for these logs:
```
📱 FCM Token: [your-token-here]
✅ Subscribed to topic: all_users
🔔 Subscribing to club notifications for club ID: 69936a49b2702c6a00284d48
🔔 Topic name: club_69936a49b2702c6a00284d48
✅ Subscribed to topic: club_69936a49b2702c6a00284d48
```

**✅ If you see these logs, subscription is working!**

### Step 4: Verify Club Selection (1 minute)
1. In the app, tap the Settings icon (⚙️) on the left
2. Make sure Newcastle United is selected
3. Tap "Save Changes"
4. Check console for:
   ```
   ❌ Unsubscribed from topic: club_[old_id]
   ✅ Subscribed to topic: club_69936a49b2702c6a00284d48
   ```

### Step 5: Send Test Notification (1 minute)
1. Keep the app OPEN (in foreground)
2. Go to your admin panel
3. Create a new highlight with Newcastle United
4. Watch the console logs

**Expected Output:**
```
📬 Foreground message received!
📬 Title: New Match Highlight
📬 Body: NEWCASTLE 2-3 EVERTON | Premier League highlights
📬 Data: {type: highlight, highlight_id: ..., club_id: 69936a49b2702c6a00284d48}
🔔 Showing local notification: New Match Highlight
✅ Local notification displayed successfully
```

**✅ You should see a notification appear on your device!**

## 🔍 What Changed?

### The Problem
- Firebase was receiving notifications but not displaying them when app was open
- This is normal behavior - FCM doesn't auto-show notifications in foreground

### The Solution
- Added `flutter_local_notifications` package
- Updated `NotificationService` to manually display notifications when app is open
- Now notifications show in ALL app states (foreground, background, terminated)

## 📱 Test All States

### Test 1: Foreground (App Open) ✅
1. Keep app open
2. Send notification
3. Should see notification banner at top
4. Console shows: "✅ Local notification displayed successfully"

### Test 2: Background (App Minimized) ✅
1. Press home button (minimize app)
2. Send notification
3. Should see system notification
4. Tap it to open app

### Test 3: Terminated (App Closed) ✅
1. Swipe app away (close completely)
2. Send notification
3. Should see system notification
4. Tap it to launch app

## ⚠️ Common Issues

### Issue: "No notification in foreground"
**Cause:** Old code didn't have flutter_local_notifications
**Fix:** Run `flutter pub get` and rebuild app

### Issue: "Wrong club notifications"
**Cause:** Subscribed to different club than backend sent to
**Fix:** 
1. Check console logs for subscribed topic
2. Should match: `club_69936a49b2702c6a00284d48`
3. If different, change club in Settings

### Issue: "No permission"
**Cause:** Notification permission not granted
**Fix:**
1. Device Settings → Apps → FanZone → Notifications → Enable
2. Or uninstall and reinstall app to see permission prompt

## 🎯 Verify Topic Match

Your backend sent to: `club_69936a49b2702c6a00284d48`

Your app should subscribe to: `club_69936a49b2702c6a00284d48`

**Check in console logs:**
```
🔔 Topic name: club_69936a49b2702c6a00284d48
✅ Subscribed to topic: club_69936a49b2702c6a00284d48
```

These MUST match exactly!

## 🔧 Debug Commands

### Print FCM Token
Look for this in console when app starts:
```
📱 FCM Token: [your-token]
```

### Test with Firebase Console
1. Copy your FCM token from console
2. Go to Firebase Console → Cloud Messaging
3. Click "Send test message"
4. Paste your token
5. Send notification
6. If you receive it, your setup is correct!

## ✅ Success Checklist

- [ ] Ran `flutter pub get`
- [ ] Rebuilt app with `flutter run`
- [ ] See FCM token in console
- [ ] See topic subscription logs
- [ ] Selected correct club in Settings
- [ ] Notification permission granted
- [ ] Sent test notification from admin
- [ ] Saw notification appear on device

## 📞 Still Not Working?

If you completed all steps and still no notification:

1. **Copy your FCM token** from console logs
2. **Test directly from Firebase Console** (not admin panel)
3. If Firebase Console works → Problem is topic subscription
4. If Firebase Console doesn't work → Problem is device/permissions

Share the console logs and I can help debug further!
