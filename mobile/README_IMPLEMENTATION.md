# FanZone Mobile App - Authentication Flow Implementation

## Overview
This implementation provides the complete authentication flow for the FanZone mobile app, including:
- Splash Screen with authentication check
- Login Screen
- Sign Up Screen with multi-step registration
- Language Selection
- Club Selection with logo display
- My Club placeholder screen

## Features Implemented

### 1. Splash Screen (FZ-MOB-SS-001)
- Displays app logo with gradient background
- Checks authentication status on startup
- Navigates to My Club if authenticated
- Navigates to Login if not authenticated
- 2-second loading animation

### 2. Login Screen (FZ-MOB-LG-001)
- Email and password fields
- Password visibility toggle
- Form validation
- JWT token storage using flutter_secure_storage
- Navigation to Sign Up
- Forgot Password placeholder
- Gradient background matching design

### 3. Sign Up Flow (FZ-MOB-SU-001)

#### Step 1: Basic Information
- First name and last name fields
- Email field
- Password field (min 6 characters)
- Form validation
- Continues to language selection

#### Step 2: Language Selection
- Displays 3 supported languages:
  - English (en)
  - Amharic (am)
  - Afaan Oromo (om)
- Single selection enforced
- Visual feedback for selected language
- Continues to club selection

#### Step 3: Club Selection
- Fetches clubs from API: `GET /api/clubs`
- Displays clubs in a 2-column grid
- Shows club logo and name
- Single club selection enforced
- Visual feedback for selected club
- Completes registration with all data

### 4. API Integration
- Base URL: `http://localhost:8080/api`
- Endpoints implemented:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/clubs`
- Secure token storage
- Error handling with user-friendly messages

## Project Structure

```
lib/
├── main.dart                           # App entry point
├── config/
│   └── constants.dart                  # API base URL configuration
├── models/
│   ├── user.dart                       # User model
│   └── club.dart                       # Club model
├── services/
│   ├── auth_service.dart               # Authentication API calls
│   └── club_service.dart               # Club API calls
└── screens/
    ├── splash_screen.dart              # Initial loading screen
    ├── login_screen.dart               # Login form
    ├── signup_screen.dart              # Registration form
    ├── language_selection_screen.dart  # Language picker
    ├── club_selection_screen.dart      # Club picker with logos
    └── my_club_screen.dart             # Home screen placeholder
```

## Dependencies

```yaml
dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.8
  http: ^1.2.0                          # HTTP requests
  shared_preferences: ^2.2.2            # Local storage
  flutter_secure_storage: ^9.0.0        # Secure token storage
```

## Setup Instructions

1. Install dependencies:
```bash
flutter pub get
```

2. Update the API base URL in `lib/config/constants.dart` if needed:
```dart
static const String baseUrl = 'http://localhost:8080/api';
```

3. Run the app:
```bash
flutter run
```

## User Flow

1. **App Launch** → Splash Screen
   - Checks for stored access token
   - If token exists → My Club Screen
   - If no token → Login Screen

2. **Login Screen**
   - User enters email and password
   - On success → My Club Screen
   - "Sign up" link → Sign Up Screen

3. **Sign Up Screen**
   - User enters name, email, password
   - "Continue" → Language Selection

4. **Language Selection**
   - User selects preferred language
   - "Continue" → Club Selection

5. **Club Selection**
   - Loads clubs from API
   - User selects favorite club
   - "Complete Registration" → Creates account
   - Auto-login → My Club Screen

## API Request Examples

### Register
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "language": "en",
  "fav_club_id": "507f1f77bcf86cd799439011"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Clubs
```
GET /api/clubs
Authorization: Bearer <token>
```

## Design Features

- Gradient background (orange to black) matching the provided UI
- Rounded input fields with semi-transparent backgrounds
- Orange accent color for buttons and selections
- Visual feedback for selected items
- Loading indicators during API calls
- Error messages via SnackBar
- Password visibility toggle
- Form validation

## Security

- JWT tokens stored in flutter_secure_storage (encrypted)
- Passwords never stored locally
- HTTPS recommended for production
- Token-based authentication

## Next Steps

To complete the implementation:
1. Implement the My Club feed screen
2. Add token refresh logic
3. Implement logout functionality
4. Add profile management
5. Implement the All News feed
6. Add the Watch tab
7. Handle network errors gracefully
8. Add loading states and shimmer effects
9. Implement pull-to-refresh
10. Add localization for UI text

## Notes

- The club selection screen requires authentication to fetch clubs. You may need to make the `/api/clubs` endpoint public or implement a temporary token mechanism.
- The UI closely matches the provided design with gradient backgrounds and orange accent colors.
- All screens include proper navigation and back button handling.
- Form validation ensures data quality before API calls.
