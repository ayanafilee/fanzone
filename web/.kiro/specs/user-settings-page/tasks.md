# Implementation Plan: User Settings Page

## Overview

This implementation plan breaks down the User Settings Page feature into discrete, incremental coding tasks. Each task builds on previous work, starting with API layer extensions, then core UI components, validation logic, and finally integration and testing. The implementation uses TypeScript, React, Next.js 14+, Redux Toolkit with RTK Query, and Tailwind CSS.

## Tasks

- [x] 1. Extend API layer with new user endpoints
  - [x] 1.1 Add changePassword mutation endpoint to userApi.ts
    - Extend lib/features/user/userApi.ts with changePassword mutation
    - Configure endpoint: PUT /api/user/password with body { current_password, new_password }
    - Set invalidatesTags: ['User'] for cache invalidation
    - Export useChangePasswordMutation hook
    - _Requirements: 3.4, 7.1, 7.5_

  - [x] 1.2 Add uploadProfileImage mutation endpoint to userApi.ts
    - Add uploadProfileImage mutation to lib/features/user/userApi.ts
    - Configure endpoint: POST /api/user/profile/image with multipart/form-data
    - Use FormData for file upload with proper headers
    - Set invalidatesTags: ['User'] for cache invalidation
    - Export useUploadProfileImageMutation hook
    - _Requirements: 2.5, 7.1, 7.4_

  - [ ]* 1.3 Write property test for API authentication headers
    - **Property 20: API authentication headers**
    - **Validates: Requirements 7.2**
    - Test that all API calls include Bearer token in Authorization header
    - Generate random tokens and verify header inclusion

- [x] 2. Create validation utility functions
  - [x] 2.1 Implement form validation utilities
    - Create lib/utils/validation.ts with validation functions
    - Implement validateName(name: string): { isValid: boolean; error?: string }
    - Implement validateEmail(email: string): { isValid: boolean; error?: string }
    - Implement validatePassword(password: string): { isValid: boolean; error?: string }
    - Implement validatePasswordMatch(password: string, confirm: string): { isValid: boolean; error?: string }
    - Implement validateImageFile(file: File): { isValid: boolean; error?: string }
    - _Requirements: 1.2, 1.3, 3.2, 3.3, 2.2, 2.3_

  - [ ]* 2.2 Write property test for name validation
    - **Property 2: Name validation**
    - **Validates: Requirements 1.2, 5.1, 5.3**
    - Test that validation rejects empty strings and strings > 100 chars
    - Test that validation accepts strings 1-100 characters
    - Use fast-check to generate random strings of various lengths

  - [ ]* 2.3 Write property test for email validation
    - **Property 3: Email format validation**
    - **Validates: Requirements 1.3, 5.2**
    - Test that validation accepts valid email formats
    - Test that validation rejects invalid formats
    - Generate random valid and invalid email strings

  - [ ]* 2.4 Write property test for password length validation
    - **Property 13: Password length validation**
    - **Validates: Requirements 3.2, 5.4**
    - Test that validation rejects passwords < 6 characters
    - Test that validation accepts passwords >= 6 characters
    - Generate random strings of various lengths

  - [ ]* 2.5 Write property test for password matching
    - **Property 14: Password confirmation matching**
    - **Validates: Requirements 3.3, 5.5**
    - Test that validation accepts identical password pairs
    - Test that validation rejects non-matching pairs
    - Generate random password pairs

  - [ ]* 2.6 Write property test for image file validation
    - **Property 8: Image file size validation**
    - **Property 9: Image file type validation**
    - **Validates: Requirements 2.2, 2.3**
    - Test file size validation (reject > 5MB, accept <= 5MB)
    - Test MIME type validation (accept image/jpeg, image/png, image/gif, image/webp)
    - Generate mock File objects with various sizes and types

- [x] 3. Build ProfileInfoSection component
  - [x] 3.1 Create ProfileInfoSection component structure
    - Create app/components/settings/ProfileInfoSection.tsx
    - Define component props interface (profile, onUpdate, isLoading)
    - Set up form state with useState for name, email, language, fav_club_id
    - Set up validation error state
    - Implement form field rendering with Tailwind styling matching dashboard design
    - Add language select with options: English (en), Amharic (am), Afaan Oromo (om)
    - Add favorite club select (fetch clubs from existing clubs API if available)
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 3.2 Add validation and submission logic to ProfileInfoSection
    - Implement onBlur validation for each field using validation utilities
    - Implement form submission handler that validates all fields
    - Call onUpdate prop with validated data
    - Display inline validation errors below fields
    - Disable submit button when form has errors or is loading
    - Show loading state on submit button during API call
    - _Requirements: 1.5, 4.2, 5.1, 5.2, 5.3, 5.6, 5.7_

  - [ ]* 3.3 Write unit tests for ProfileInfoSection
    - Test component renders with initial profile data
    - Test form fields update on user input
    - Test validation errors display on blur
    - Test submit button disabled when form invalid
    - Test onUpdate called with correct data on submit
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 4. Build ProfileImageSection component
  - [x] 4.1 Create ProfileImageSection component structure
    - Create app/components/settings/ProfileImageSection.tsx
    - Define component props interface (currentImageUrl, onUpload, isLoading)
    - Set up state for selected file and preview URL
    - Render current image or default placeholder
    - Add file input with accept="image/jpeg,image/png,image/gif,image/webp"
    - Style with Tailwind matching dashboard design (rounded-[2rem] cards)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 4.2 Add image preview and upload logic to ProfileImageSection
    - Implement file selection handler with validation
    - Create preview URL using URL.createObjectURL for valid files
    - Display preview image when file selected
    - Implement upload handler that calls onUpload prop
    - Clean up object URLs on component unmount
    - Show loading state on upload button during API call
    - Display validation errors for file size and type
    - _Requirements: 2.4, 2.5, 4.3_

  - [ ]* 4.3 Write unit tests for ProfileImageSection
    - Test displays current image or placeholder
    - Test preview shown when valid file selected
    - Test validation errors for invalid files
    - Test onUpload called with file on submit
    - Test loading state during upload
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 4.4 Write property test for image preview display
    - **Property 10: Image preview display**
    - **Validates: Requirements 2.4**
    - Test that selecting valid image files triggers preview display
    - Generate various valid image file objects

- [x] 5. Build PasswordChangeSection component
  - [x] 5.1 Create PasswordChangeSection component structure
    - Create app/components/settings/PasswordChangeSection.tsx
    - Define component props interface (onChangePassword, isLoading)
    - Set up form state for current_password, new_password, confirm_password
    - Set up validation error state
    - Render three password input fields with type="password"
    - Style with Tailwind matching dashboard design
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 5.2 Add validation and submission logic to PasswordChangeSection
    - Implement onBlur validation for password fields
    - Validate new password length (min 6 characters)
    - Validate password confirmation matches new password
    - Implement form submission handler
    - Call onChangePassword prop with validated data
    - Clear all password fields after successful submission
    - Display inline validation errors
    - Show loading state on submit button during API call
    - _Requirements: 3.4, 3.5, 4.4, 5.4, 5.5_

  - [ ]* 5.3 Write unit tests for PasswordChangeSection
    - Test password inputs are masked (type="password")
    - Test validation for password length
    - Test validation for password matching
    - Test form clears after successful change
    - Test loading state during submission
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [x] 6. Create main Settings page component
  - [x] 6.1 Build Settings page layout and structure
    - Create app/settings/page.tsx as main page component
    - Mark as 'use client' for client-side rendering
    - Import and use useGetProfileQuery to fetch profile on mount
    - Set up react-hot-toast for notifications
    - Create card-based layout with three sections using Tailwind
    - Use bg-white, rounded-[2rem], shadow-sm for cards matching dashboard
    - Implement responsive grid layout (single column on mobile, multi-column on desktop)
    - Handle loading state while fetching profile
    - Handle error state if profile fetch fails
    - _Requirements: 1.1, 4.1, 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 6.2 Integrate ProfileInfoSection with API mutations
    - Import and use useUpdateProfileMutation hook
    - Create handleProfileUpdate function that calls mutation
    - Pass profile data, handleProfileUpdate, and isLoading to ProfileInfoSection
    - Display success toast on successful update
    - Display error toast on failed update
    - _Requirements: 1.5, 1.6, 1.7_

  - [x] 6.3 Integrate ProfileImageSection with API mutations
    - Import and use useUploadProfileImageMutation hook
    - Create handleImageUpload function that calls mutation with FormData
    - Pass currentImageUrl, handleImageUpload, and isLoading to ProfileImageSection
    - Display success toast on successful upload
    - Display error toast on failed upload
    - _Requirements: 2.5, 2.6_

  - [x] 6.4 Integrate PasswordChangeSection with API mutations
    - Import and use useChangePasswordMutation hook
    - Create handlePasswordChange function that calls mutation
    - Pass handlePasswordChange and isLoading to PasswordChangeSection
    - Display success toast on successful change
    - Display error toast on failed change
    - _Requirements: 3.4, 3.5_

  - [ ]* 6.5 Write property test for profile update flow
    - **Property 5: Profile update API call**
    - **Property 6: Profile update success feedback**
    - **Validates: Requirements 1.5, 1.6**
    - Test that valid profile data triggers correct API call
    - Test that success response displays notification and updates data
    - Generate random valid profile data

  - [ ]* 6.6 Write property test for error handling
    - **Property 7: Profile update error handling**
    - **Validates: Requirements 1.7, 7.7**
    - Test that API errors display user-friendly messages
    - Generate various API error responses

  - [ ]* 6.7 Write property test for image upload flow
    - **Property 11: Image upload API call**
    - **Property 12: Image upload success feedback**
    - **Validates: Requirements 2.5, 2.6**
    - Test that valid files trigger correct API call with multipart/form-data
    - Test that success response updates displayed image

  - [ ]* 6.8 Write property test for password change flow
    - **Property 15: Password change API call**
    - **Property 16: Password change success feedback**
    - **Validates: Requirements 3.4, 3.5**
    - Test that valid password data triggers correct API call
    - Test that success response clears form and shows notification

- [x] 7. Implement loading states and user feedback
  - [x] 7.1 Add comprehensive loading state handling
    - Ensure all mutation buttons show loading indicators during API calls
    - Disable buttons during loading to prevent double submission
    - Add skeleton loading state for initial profile fetch
    - Ensure loading states are removed when operations complete
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 7.2 Implement toast notification system
    - Configure react-hot-toast with custom styling matching dashboard theme
    - Add success toasts for all successful operations
    - Add error toasts for all failed operations
    - Ensure toasts auto-dismiss after appropriate duration
    - _Requirements: 1.6, 1.7, 2.6, 3.5, 4.6, 4.7_

  - [ ]* 7.3 Write property test for loading states
    - **Property 17: Loading state during mutations**
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5**
    - Test that submit buttons show loading and are disabled during API calls
    - Test that loading state is removed after completion

  - [ ]* 7.4 Write property test for error persistence
    - **Property 18: Error message clearing**
    - **Validates: Requirements 5.6**
    - Test that correcting invalid input removes error messages
    - Generate invalid then valid inputs

- [x] 8. Add cache invalidation and data persistence
  - [x] 8.1 Verify cache invalidation configuration
    - Confirm all mutations have invalidatesTags: ['User']
    - Test that profile data refetches after successful mutations
    - Verify that updated data displays immediately after mutations
    - _Requirements: 7.3, 7.4_

  - [ ]* 8.2 Write property test for cache invalidation
    - **Property 21: Cache invalidation after mutations**
    - **Validates: Requirements 7.3, 7.4**
    - Test that successful mutations invalidate User cache tag
    - Verify automatic data refetch occurs

  - [ ]* 8.3 Write property test for data persistence
    - **Property 23: Data persistence across page reloads**
    - **Validates: Requirements 8.2, 8.3**
    - Test that saved changes persist across page reloads
    - Simulate page refresh and verify data remains updated

  - [ ]* 8.4 Write property test for image replacement
    - **Property 24: Profile image replacement**
    - **Validates: Requirements 8.4**
    - Test that uploading new image replaces previous image
    - Verify only one image is displayed, not multiple

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Add form submission prevention and error highlighting
  - [x] 10.1 Implement form validation before submission
    - Add validation check before all form submissions
    - Prevent API calls when validation errors exist
    - Highlight all invalid fields when submission attempted with errors
    - Add visual indicators (red borders, error icons) for invalid fields
    - _Requirements: 5.7_

  - [ ]* 10.2 Write property test for submission prevention
    - **Property 19: Form submission prevention with errors**
    - **Validates: Requirements 5.7**
    - Test that forms with validation errors don't trigger API calls
    - Generate invalid form data and verify no API call occurs

- [ ] 11. Implement session persistence after password change
  - [ ] 11.1 Verify authentication session handling
    - Ensure password change mutation doesn't clear auth tokens
    - Verify user remains logged in after password change
    - Test that subsequent API calls work after password change
    - _Requirements: 7.5_

  - [ ]* 11.2 Write property test for session persistence
    - **Property 22: Session persistence after password change**
    - **Validates: Requirements 7.5**
    - Test that auth session remains active after password change
    - Verify no re-login required

- [ ] 12. Add responsive design and accessibility
  - [ ] 12.1 Implement responsive layout
    - Use Tailwind responsive classes for mobile/desktop layouts
    - Test layout on various screen sizes (mobile, tablet, desktop)
    - Ensure cards stack vertically on mobile, multi-column on desktop
    - Verify all interactive elements are accessible on touch devices
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ] 12.2 Add accessibility features
    - Add proper ARIA labels to all form inputs
    - Ensure error messages are announced to screen readers
    - Implement keyboard navigation for all interactive elements
    - Add focus management after form submissions
    - Verify color contrast meets WCAG AA standards
    - Test with keyboard-only navigation
    - _Requirements: 6.4_

- [ ] 13. Integration testing and error handling
  - [ ]* 13.1 Write integration tests for complete flows
    - Test complete profile update flow: load → edit → submit → success
    - Test complete image upload flow: select → preview → upload → success
    - Test complete password change flow: fill → submit → success → clear
    - Test error recovery: error → correct → retry → success
    - _Requirements: 1.1-1.7, 2.1-2.6, 3.1-3.5_

  - [ ] 13.2 Add graceful error handling
    - Add fallback for failed profile image loads (default avatar)
    - Add retry button for failed profile fetch
    - Handle network errors with user-friendly messages
    - Implement error boundaries for component errors
    - _Requirements: 1.7, 7.7_

- [ ] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples and edge cases
- The implementation follows the existing dashboard design system
- All API calls use RTK Query hooks for consistency
- Toast notifications provide user feedback for all operations
