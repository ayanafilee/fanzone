# Design Document: User Settings Page

## Overview

The User Settings Page is a React component built with Next.js 14+ that provides a comprehensive interface for users to manage their profile information, security settings, and preferences. The page integrates with the existing FanZone admin dashboard infrastructure, utilizing Redux Toolkit with RTK Query for state management and API communication.

The design follows a card-based layout pattern consistent with the existing dashboard aesthetic, organizing settings into three logical sections: Profile Information, Profile Picture, and Security. Each section is implemented as a self-contained form with real-time validation, loading states, and user feedback mechanisms.

Key design principles:
- **Separation of concerns**: API logic, UI components, and validation are clearly separated
- **Progressive enhancement**: Forms work with client-side validation before server submission
- **Optimistic UI updates**: Cache invalidation ensures data consistency after mutations
- **Accessibility**: Proper form labels, error announcements, and keyboard navigation
- **Responsive design**: Mobile-first approach with adaptive layouts

## Architecture

### Component Hierarchy

```
app/settings/page.tsx (Settings Page - Main Container)
├── ProfileInfoSection (Profile editing form)
│   ├── Input fields (name, email)
│   ├── Select field (language)
│   ├── Select field (favorite club)
│   └── Submit button with loading state
├── ProfileImageSection (Image upload form)
│   ├── Current image display
│   ├── Image preview
│   ├── File input
│   └── Upload button with loading state
└── PasswordChangeSection (Password change form)
    ├── Current password input
    ├── New password input
    ├── Confirm password input
    └── Submit button with loading state
```

### Data Flow

1. **Initial Load**: Settings page mounts → `useGetProfileQuery()` fetches profile → Redux cache populated → UI renders with data
2. **Profile Update**: User edits form → Client-side validation → `useUpdateProfileMutation()` → API call → Success/Error → Cache invalidation → UI refresh
3. **Image Upload**: User selects file → Preview displayed → `useUploadProfileImageMutation()` → Multipart form data → API call → Success/Error → Cache invalidation → UI refresh
4. **Password Change**: User fills form → Validation → `useChangePasswordMutation()` → API call → Success/Error → Form cleared

### API Integration Layer

The API layer extends `lib/features/user/userApi.ts` with three new endpoints:

```typescript
// Existing endpoints
- getProfile: GET /api/user/profile
- updateProfile: PUT /api/user/profile

// New endpoints to add
- changePassword: PUT /api/user/password
- uploadProfileImage: POST /api/user/profile/image
```

All endpoints use the existing `apiSlice` base configuration with automatic Bearer token injection and 401 refresh token handling.

## Components and Interfaces

### Main Settings Page Component

**Location**: `app/settings/page.tsx`

**Responsibilities**:
- Orchestrate the three settings sections
- Manage toast notifications for success/error feedback
- Handle overall page layout and responsive design

**Key Hooks**:
- `useGetProfileQuery()`: Fetch current user profile on mount
- `useUpdateProfileMutation()`: Update profile information
- `useChangePasswordMutation()`: Change user password
- `useUploadProfileImageMutation()`: Upload profile image

### ProfileInfoSection Component

**Props**:
```typescript
interface ProfileInfoSectionProps {
  profile: UserProfile;
  onUpdate: (data: ProfileUpdateData) => Promise<void>;
  isLoading: boolean;
}
```

**State**:
- Form fields: name, email, language, fav_club_id
- Field-level validation errors
- Form dirty state (to enable/disable submit)

**Validation Rules**:
- Name: Required, max 100 characters
- Email: Required, valid email format
- Language: One of ["en", "am", "om"]
- Favorite club: Optional, valid club ID

### ProfileImageSection Component

**Props**:
```typescript
interface ProfileImageSectionProps {
  currentImageUrl?: string;
  onUpload: (file: File) => Promise<void>;
  isLoading: boolean;
}
```

**State**:
- Selected file
- Preview URL (created with URL.createObjectURL)
- Validation errors

**Validation Rules**:
- File size: Max 5MB
- File type: JPEG, PNG, GIF, WebP
- File must be an image (checked via MIME type)

### PasswordChangeSection Component

**Props**:
```typescript
interface PasswordChangeSectionProps {
  onChangePassword: (data: PasswordChangeData) => Promise<void>;
  isLoading: boolean;
}
```

**State**:
- current_password
- new_password
- confirm_password
- Field-level validation errors

**Validation Rules**:
- Current password: Required
- New password: Required, min 6 characters
- Confirm password: Required, must match new_password

## Data Models

### UserProfile (from API)

```typescript
interface UserProfile {
  id: number;
  name: string;
  email: string;
  language: 'en' | 'am' | 'om';
  fav_club_id: number | null;
  role: string;
  profile_image_url: string | null;
  created_at: string;
}
```

### ProfileUpdateData (request payload)

```typescript
interface ProfileUpdateData {
  name: string;
  email: string;
  language: 'en' | 'am' | 'om';
  fav_club_id?: number | null;
}
```

### PasswordChangeData (request payload)

```typescript
interface PasswordChangeData {
  current_password: string;
  new_password: string;
}
```

### ImageUploadData (request payload)

```typescript
// Sent as multipart/form-data
FormData {
  image: File
}
```

### API Response Types

```typescript
interface ApiSuccessResponse {
  message: string;
  data?: any;
}

interface ApiErrorResponse {
  error: string;
  details?: Record<string, string[]>;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, I've identified the following consolidations:

**Redundancy eliminations**:
- Properties 1.2, 5.1, 5.3 all test name validation → Combine into single comprehensive name validation property
- Properties 1.3, 5.2 both test email validation → Combine into single email validation property
- Properties 3.2, 5.4 both test password length → Combine into single password length property
- Properties 3.3, 5.5 both test password matching → Combine into single password matching property
- Properties 4.2, 4.3, 4.4 all test button loading states → Combine into single loading state property
- Properties 7.3, 7.4 both test cache invalidation → Combine into single cache invalidation property
- Properties 8.2, 8.3 both test data persistence across reloads → Combine into single persistence property

**Edge cases handled by generators**:
- 2.7, 2.8, 3.6, 3.7, 5.1-5.5 are specific error cases that will be covered by property test generators

**Final property count**: 20 unique, non-redundant properties

### Correctness Properties

**Property 1: Profile data fetching and display**
*For any* authenticated user, when the Settings page loads, the page should fetch the user's profile via the API and display all profile fields (name, email, language, favorite club, profile image).
**Validates: Requirements 1.1, 2.1**

**Property 2: Name validation**
*For any* string input in the name field, the validation should reject empty strings and strings exceeding 100 characters, while accepting all strings between 1 and 100 characters.
**Validates: Requirements 1.2, 5.1, 5.3**

**Property 3: Email format validation**
*For any* string input in the email field, the validation should accept only strings matching valid email format (containing @ and domain) and reject all other strings.
**Validates: Requirements 1.3, 5.2**

**Property 4: Language selection restriction**
*For any* language selection, the system should only accept values from the set ["en", "am", "om"] and reject all other values.
**Validates: Requirements 1.4**

**Property 5: Profile update API call**
*For any* valid profile data (name, email, language, fav_club_id), submitting the profile form should trigger a PUT request to /api/user/profile with the exact data provided.
**Validates: Requirements 1.5**

**Property 6: Profile update success feedback**
*For any* successful profile update API response, the page should display a success notification and the displayed profile data should reflect the updated values.
**Validates: Requirements 1.6**

**Property 7: Profile update error handling**
*For any* failed profile update API response, the page should display an error message containing the error details from the API response.
**Validates: Requirements 1.7, 7.7**

**Property 8: Image file size validation**
*For any* file selected for upload, the validation should reject files exceeding 5MB and accept files at or below 5MB.
**Validates: Requirements 2.2**

**Property 9: Image file type validation**
*For any* file selected for upload, the validation should accept only files with MIME types image/jpeg, image/png, image/gif, or image/webp, and reject all other file types.
**Validates: Requirements 2.3**

**Property 10: Image preview display**
*For any* valid image file selected, the page should display a preview of the image before upload using a data URL or object URL.
**Validates: Requirements 2.4**

**Property 11: Image upload API call**
*For any* valid image file, submitting the upload form should trigger a POST request to /api/user/profile/image with the file encoded as multipart/form-data.
**Validates: Requirements 2.5**

**Property 12: Image upload success feedback**
*For any* successful image upload API response, the page should display a success notification and update the displayed profile image to the new image URL.
**Validates: Requirements 2.6**

**Property 13: Password length validation**
*For any* string input in the new password field, the validation should reject strings shorter than 6 characters and accept strings of 6 or more characters.
**Validates: Requirements 3.2, 5.4**

**Property 14: Password confirmation matching**
*For any* pair of password inputs (new_password, confirm_password), the validation should accept only when both strings are identical and reject when they differ.
**Validates: Requirements 3.3, 5.5**

**Property 15: Password change API call**
*For any* valid password change data (current_password, new_password), submitting the password form should trigger a PUT request to /api/user/password with both password fields.
**Validates: Requirements 3.4**

**Property 16: Password change success feedback**
*For any* successful password change API response, the page should display a success notification and clear all password input fields.
**Validates: Requirements 3.5**

**Property 17: Loading state during mutations**
*For any* form submission (profile update, image upload, or password change), the submit button should display a loading indicator and be disabled until the API operation completes.
**Validates: Requirements 4.2, 4.3, 4.4, 4.5**

**Property 18: Error message clearing**
*For any* field with a validation error, when the user corrects the input to a valid value, the error message should be removed.
**Validates: Requirements 5.6**

**Property 19: Form submission prevention with errors**
*For any* form with validation errors, attempting to submit should prevent the API call and highlight all invalid fields.
**Validates: Requirements 5.7**

**Property 20: API authentication headers**
*For any* API call made by the Settings page, the request should include a Bearer token in the Authorization header retrieved from Redux state or localStorage.
**Validates: Requirements 7.2**

**Property 21: Cache invalidation after mutations**
*For any* successful mutation (profile update or image upload), the API client should invalidate the 'User' cache tag to trigger automatic data refetch.
**Validates: Requirements 7.3, 7.4**

**Property 22: Session persistence after password change**
*For any* successful password change, the user's authentication session should remain active without requiring re-login.
**Validates: Requirements 7.5**

**Property 23: Data persistence across page reloads**
*For any* profile changes saved successfully, refreshing the page or navigating away and returning should display the updated data.
**Validates: Requirements 8.2, 8.3**

**Property 24: Profile image replacement**
*For any* new profile image uploaded, the displayed image should be replaced with the new image URL, not appended to existing images.
**Validates: Requirements 8.4**

## Error Handling

### Client-Side Validation Errors

The page implements immediate validation feedback for all form inputs:

1. **Name validation errors**:
   - Empty name: "Name is required"
   - Name too long: "Name must not exceed 100 characters"

2. **Email validation errors**:
   - Empty email: "Email is required"
   - Invalid format: "Please enter a valid email address"

3. **Password validation errors**:
   - Empty current password: "Current password is required"
   - New password too short: "Password must be at least 6 characters"
   - Passwords don't match: "Passwords must match"

4. **Image validation errors**:
   - File too large: "Image must be less than 5MB"
   - Invalid format: "Image must be JPEG, PNG, GIF, or WebP"

### API Error Handling

All API errors are caught and transformed into user-friendly messages:

1. **Network errors**: "Unable to connect to server. Please check your internet connection."
2. **Authentication errors (401)**: Handled automatically by apiSlice refresh token logic
3. **Validation errors (400)**: Display specific field errors from API response
4. **Server errors (500)**: "An unexpected error occurred. Please try again later."
5. **Conflict errors (409)**: Display specific conflict message (e.g., "Email already in use")

### Error Display Strategy

- **Inline errors**: Displayed below the relevant form field in red text
- **Toast notifications**: Used for API errors and success messages
- **Error persistence**: Validation errors remain until corrected; API errors remain until dismissed or form resubmitted

### Graceful Degradation

- If profile image fails to load, display default avatar placeholder
- If clubs list fails to load, favorite club field becomes a text input
- If profile fetch fails on load, display error state with retry button

## Testing Strategy

### Dual Testing Approach

The User Settings Page requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests** focus on:
- Specific examples of valid and invalid inputs
- Edge cases (empty strings, boundary values, special characters)
- Integration between components and API layer
- Error conditions and error message display
- UI interactions (button clicks, form submissions)

**Property-Based Tests** focus on:
- Universal validation rules across all possible inputs
- API call correctness for any valid data
- State management consistency across operations
- Cache invalidation behavior
- Data persistence properties

### Property-Based Testing Configuration

**Library**: Use `@fast-check/jest` for TypeScript/React property-based testing

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with format: `Feature: user-settings-page, Property {N}: {description}`
- Custom generators for:
  - Valid/invalid names (0-150 characters)
  - Valid/invalid emails
  - Valid/invalid passwords (0-20 characters)
  - Valid language codes and invalid codes
  - File objects with various sizes and MIME types
  - API response objects (success and error)

**Example Property Test Structure**:
```typescript
describe('Feature: user-settings-page, Property 2: Name validation', () => {
  it('should reject empty strings and strings > 100 chars, accept 1-100 chars', () => {
    fc.assert(
      fc.property(fc.string(), (name) => {
        const result = validateName(name);
        if (name.length === 0 || name.length > 100) {
          expect(result.isValid).toBe(false);
        } else {
          expect(result.isValid).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });
});
```

### Unit Test Coverage

**ProfileInfoSection**:
- Renders with initial profile data
- Updates form fields on user input
- Displays validation errors on blur
- Disables submit button when form is invalid
- Calls onUpdate with correct data on submit
- Displays loading state during submission

**ProfileImageSection**:
- Displays current image or placeholder
- Shows preview when valid file selected
- Validates file size and type
- Calls onUpload with file on submit
- Displays loading state during upload

**PasswordChangeSection**:
- Masks password inputs
- Validates password length and matching
- Clears form after successful change
- Displays loading state during submission

**API Integration**:
- getProfile query fetches correct endpoint
- updateProfile mutation sends PUT with correct payload
- changePassword mutation sends PUT with correct payload
- uploadProfileImage mutation sends POST with multipart/form-data
- All mutations invalidate 'User' cache tag

### Integration Testing

Test the complete flow:
1. Load page → Profile fetched → Form populated
2. Edit profile → Submit → Success notification → Data refreshed
3. Upload image → Preview shown → Submit → Image updated
4. Change password → Submit → Success → Form cleared
5. API error → Error message displayed → User corrects → Retry succeeds

### Accessibility Testing

- All form inputs have associated labels
- Error messages are announced to screen readers
- Keyboard navigation works for all interactive elements
- Focus management after form submission
- Color contrast meets WCAG AA standards
