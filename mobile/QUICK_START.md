# FanZone - Quick Start Guide

## What's Been Implemented

✅ Splash Screen with auth check
✅ Login Screen with gradient UI
✅ Sign Up Screen (multi-step)
✅ Language Selection (English, Amharic, Afaan Oromo)
✅ Club Selection with logo display
✅ API integration with http://localhost:8080/api
✅ Secure token storage
✅ Form validation
✅ Error handling

## Run the App

```bash
# Install dependencies
flutter pub get

# Run on your device/emulator
flutter run
```

## Test the Flow

1. Launch app → See splash screen
2. No auth → Redirects to Login
3. Click "Sign up" → Enter name, email, password
4. Click "Continue" → Select language
5. Click "Continue" → Select favorite club
6. Click "Complete Registration" → Account created
7. Auto-login → My Club screen

## Configuration

Edit `lib/config/constants.dart` to change API URL:
```dart
static const String baseUrl = 'http://your-server:8080/api';
```

## File Structure

```
lib/
├── main.dart                    # Entry point
├── config/constants.dart        # API config
├── models/                      # Data models
├── services/                    # API services
└── screens/                     # UI screens
```

## Key Features

- Gradient UI matching design mockup
- Secure JWT token storage
- Multi-step registration flow
- Club logos from API
- Language preference selection
- Form validation
- Error handling

## API Endpoints Used

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Authenticate
- `GET /api/clubs` - Fetch clubs with logos

That's it! The authentication flow is complete and ready to test.
