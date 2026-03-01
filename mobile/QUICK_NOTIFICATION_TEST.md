# Quick Notification Test - 5 Minutes

## 🚀 Fastest Way to Test Notifications

### Step 1: Get Your FCM Token (30 seconds)
```bash
flutter run
```
Look for this in the console:
```
📱 FCM Token: eXaMpLeToKeN123...
```
**Copy the entire token!**

---

### Step 2: Send Test Notification (2 minutes)

#### Option A: Firebase Console (Recommended)
1. Go to: https://console.firebase.google.com
2. Select your project
3. Click: **Engage** → **Messaging** → **New campaign**
4. Select: **Firebase Notification messages**
5. Fill in:
   - Title: `Test Notification`
   - Text: `This is a test message`
6. Click **Next**
7. Select: **Topic** → Enter: `all_news`
8. Click **Next** → **Next** → **Publish**

#### Option B: Send to Your Device Only
1. In Firebase Console → **Cloud Messaging**
2. Click **"Send test message"**
3. Paste your FCM token
4. Click **Test**

---

### Step 3: Verify (1 minute)

✅ **Check your device notification tray**
✅ **Look for the notification**
✅ **Tap it** - App should open

---

## 📋 Test Checklist

Test these 3 scenarios:

1. **App Open (Foreground)**
   - Keep app open
   - Send notification
   - Should appear at top of screen

2. **App in Background**
   - Press home button
   - Send notification
   - Should appear in notification tray

3. **App Closed**
   - Swipe away app
   - Send notification
   - Should appear in notification tray
   - Tap it → App launches

---

## 🎯 Topics You Can Use

Your app subscribes to these topics automatically:

- `all_news` - All users receive these
- `club_{club_id}` - Only users who selected that club

**Example club topics:**
- `club_507f1f77bcf86cd799439012` (Arsenal)
- `club_507f1f77bcf86cd799439013` (Chelsea)

---

## ⚡ Quick Commands

### View FCM Token:
```bash
flutter run | grep "FCM Token"
```

### View All Logs:
```bash
adb logcat | grep -E "FCM|Notification"
```

### Reinstall App:
```bash
flutter clean
adb uninstall com.example.fanzone
flutter run
```

---

## 🐛 Common Issues

### No notification received?
1. Check internet connection
2. Wait 30 seconds
3. Verify FCM token is correct
4. Rebuild app: `flutter clean && flutter run`

### Only works when app is open?
- This is normal! Test on physical device, not emulator

### Token is null?
- Check `google-services.json` is in `android/app/`
- Verify Firebase is initialized in `main.dart`

---

## 📱 Test Using curl (Advanced)

Replace `YOUR_SERVER_KEY` with your Firebase Server Key:

```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "/topics/all_news",
    "notification": {
      "title": "Test Notification",
      "body": "This is a test message",
      "sound": "default"
    }
  }'
```

**Get Server Key:**
Firebase Console → Project Settings → Cloud Messaging → Server key

---

## ✅ Success Indicators

You'll know it's working when you see:

1. **In console logs:**
   ```
   📱 FCM Token: eXaMpLeToKeN...
   ✅ Subscribed to topic: all_news
   ✅ Subscribed to topic: club_507f1f77bcf86cd799439012
   📬 Foreground message: Test Notification
   ```

2. **On device:**
   - Notification appears in tray
   - Tapping opens the app
   - Notification bell icon shows in app header

---

**That's it! You're ready to test notifications! 🎉**

For detailed testing guide, see: `NOTIFICATION_TESTING_GUIDE.md`
