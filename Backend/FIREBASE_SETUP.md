# Firebase Configuration Setup

## Important: Firebase Service Account Key

The Firebase service account key file is **NOT** included in the repository for security reasons.

### Required File

You need to place the Firebase service account key file at:
```
internal/config/fanzone-c7f93-firebase-adminsdk-fbsvc-7fa1955ab1.json
```

### How to Get the File

1. **If you're deploying to production:**
   - Contact the project administrator to get the Firebase service account key
   - Or download it from Firebase Console

2. **Download from Firebase Console:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select project: `fanzone-c7f93`
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the file as `fanzone-c7f93-firebase-adminsdk-fbsvc-7fa1955ab1.json`
   - Place it in `internal/config/` directory

### For Render Deployment

Since the Firebase config file is not in the repository, you need to add it as a secret file in Render:

1. Go to your Render service dashboard
2. Click on "Environment" tab
3. Scroll down to "Secret Files"
4. Click "Add Secret File"
5. Set filename: `internal/config/fanzone-c7f93-firebase-adminsdk-fbsvc-7fa1955ab1.json`
6. Paste the entire JSON content of your Firebase service account key
7. Click "Save Changes"

Render will automatically create this file in the correct location during deployment.

### Verify Setup

The server will log one of these messages on startup:

✅ Success:
```
Firebase Cloud Messaging initialized successfully
Push notifications enabled
```

❌ Failure:
```
Warning: Failed to initialize FCM: ...
Push notifications will be disabled
```

If FCM fails to initialize, the server will still run but push notifications won't work.

### Security Notes

- ⚠️ **NEVER** commit the Firebase service account key to git
- ⚠️ Keep the key file secure and private
- ⚠️ Rotate keys periodically for security
- ⚠️ The key is already added to `.gitignore`

### File Format

The Firebase service account key should be a JSON file with this structure:
```json
{
  "type": "service_account",
  "project_id": "fanzone-c7f93",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@fanzone-c7f93.iam.gserviceaccount.com",
  ...
}
```
