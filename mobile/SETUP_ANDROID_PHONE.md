# Setup for Physical Android Phone

## Problem
`localhost` doesn't work on a physical Android phone because it refers to the phone itself, not your computer.

## Solution
Use your computer's local IP address instead.

## Step 1: Find Your Computer's IP Address

### On Windows:
1. Open Command Prompt (cmd)
2. Run: `ipconfig`
3. Look for "IPv4 Address" under your active network adapter
4. Example: `192.168.1.100`

### On Mac:
1. Open Terminal
2. Run: `ifconfig | grep "inet " | grep -v 127.0.0.1`
3. Look for your local IP (usually starts with 192.168 or 10.0)
4. Example: `192.168.1.100`

### On Linux:
1. Open Terminal
2. Run: `hostname -I` or `ip addr show`
3. Look for your local IP
4. Example: `192.168.1.100`

## Step 2: Update the App Configuration

Open `lib/config/constants.dart` and replace `YOUR_COMPUTER_IP` with your actual IP:

```dart
class AppConstants {
  static const String baseUrl = 'http://192.168.1.100:8080/api';
  //                                    ^^^^^^^^^^^^^^
  //                                    Your IP here
}
```

## Step 3: Make Sure Both Devices Are on Same Network

- Your computer and phone must be on the same WiFi network
- Disable any VPN on either device
- Check your firewall isn't blocking port 8080

## Step 4: Test Backend Accessibility

From your phone's browser, try to access:
```
http://YOUR_IP:8080/api/clubs
```

If you see JSON data, it's working!

## Step 5: Run the App

```bash
flutter run
```

## Common Issues

### Issue 1: Connection Refused
- Make sure backend is running
- Check firewall settings
- Verify both devices on same WiFi

### Issue 2: Timeout
- Check if your router blocks device-to-device communication
- Try disabling Windows Firewall temporarily
- Make sure backend is listening on 0.0.0.0, not just 127.0.0.1

### Issue 3: Still Not Working
Try these backend configurations:

**If using Node.js/Express:**
```javascript
app.listen(8080, '0.0.0.0', () => {
  console.log('Server running on 0.0.0.0:8080');
});
```

**If using Go:**
```go
http.ListenAndServe("0.0.0.0:8080", handler)
```

## Quick Test

After updating the IP, the console logs should show:
```
🔵 ClubService: URL = http://192.168.1.100:8080/api/clubs
🔵 ClubService: Response status code = 200
🔵 ClubService: Successfully parsed 20 clubs
```

If you see connection errors, double-check:
1. IP address is correct
2. Backend is running
3. Both on same WiFi
4. Firewall allows connections
