# Dynamic Notifications Implementation Guide

## Overview
The notification system now supports dynamic action buttons based on backend payload. The backend can specify custom actions and labels for each notification.

## Backend Payload Format

### For Highlights
```json
{
  "notification": {
    "title": "New Match Highlight",
    "body": "NEWCASTLE 2-3 EVERTON"
  },
  "android": {
    "notification": {
      "image_url": "https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg",
      "click_action": "FLUTTER_NOTIFICATION_CLICK"
    }
  },
  "data": {
    "type": "highlight",
    "highlight_id": "69a4037104d8e22f86405b98",
    "video_url": "https://youtube.com/watch?v=VIDEO_ID",
    "image_url": "https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg",
    "action_left": "watch",
    "action_left_label": "Watch",
    "action_right": "dismiss",
    "action_right_label": "Dismiss"
  }
}
```

### For News
```json
{
  "notification": {
    "title": "New news from Arsenal FC",
    "body": "Big Win Today"
  },
  "android": {
    "notification": {
      "image_url": "https://your-cdn.com/news/image.jpg",
      "click_action": "FLUTTER_NOTIFICATION_CLICK"
    }
  },
  "data": {
    "type": "news",
    "content_id": "news123",
    "image_url": "https://your-cdn.com/news/image.jpg",
    "action_left": "read",
    "action_left_label": "Read",
    "action_right": "dismiss",
    "action_right_label": "Dismiss"
  }
}
```

## Action Button System

### How It Works

The app creates 3 action buttons:
1. **Left Action** (from backend) - Primary action
2. **Middle Action** (automatic) - "Watch Later" or "Read Later"
3. **Right Action** (from backend) - Usually "Dismiss"

### Example Result

For a highlight notification:
```
[Watch] [Watch Later] [Dismiss]
```

For a news notification:
```
[Read] [Read Later] [Dismiss]
```

## Supported Actions

### Primary Actions (action_left)
- `watch` - Opens video immediately
- `read` - Opens article immediately
- Any custom action - Will open content

### Automatic Middle Actions
- `watch_later` - Saves highlight for later (automatic for type: highlight)
- `read_later` - Saves news for later (automatic for type: news)

### Secondary Actions (action_right)
- `dismiss` - Dismisses notification
- `turn_off` - Same as dismiss
- Any custom action with `cancelNotification: true`

## Required Fields

### Minimum Required
```json
{
  "notification": {
    "title": "Title",
    "body": "Body"
  },
  "data": {
    "type": "highlight" // or "news"
  }
}
```

### Recommended (with actions)
```json
{
  "notification": {
    "title": "Title",
    "body": "Body"
  },
  "data": {
    "type": "highlight",
    "highlight_id": "...",
    "image_url": "...",
    "action_left": "watch",
    "action_left_label": "Watch",
    "action_right": "dismiss",
    "action_right_label": "Dismiss"
  }
}
```

### Full (with all features)
```json
{
  "notification": {
    "title": "Title",
    "body": "Body"
  },
  "android": {
    "notification": {
      "image_url": "...",
      "click_action": "FLUTTER_NOTIFICATION_CLICK"
    }
  },
  "data": {
    "type": "highlight",
    "highlight_id": "...",
    "video_url": "...",
    "image_url": "...",
    "club_id": "...",
    "club_name": "...",
    "action_left": "watch",
    "action_left_label": "Watch",
    "action_right": "dismiss",
    "action_right_label": "Dismiss"
  }
}
```

## Image URL Handling

The app checks for image URLs in this order:
1. `data.image_url`
2. `android.notification.image_url`
3. `notification.android.imageUrl` (FCM format)

If no valid image URL is found, shows text-only notification.

## Testing

### Test 1: Basic Notification (No Image)
```json
{
  "notification": {
    "title": "Test Notification",
    "body": "This is a test"
  },
  "data": {
    "type": "highlight",
    "highlight_id": "test123"
  }
}
```

**Expected:**
- Text-only notification
- Default actions: [Watch] [Watch Later] [Turn Off]

### Test 2: With Custom Actions
```json
{
  "notification": {
    "title": "Test with Actions",
    "body": "Custom action buttons"
  },
  "data": {
    "type": "highlight",
    "highlight_id": "test123",
    "action_left": "watch",
    "action_left_label": "Watch Now",
    "action_right": "dismiss",
    "action_right_label": "Not Interested"
  }
}
```

**Expected:**
- Text-only notification
- Custom actions: [Watch Now] [Watch Later] [Not Interested]

### Test 3: With Image
```json
{
  "notification": {
    "title": "Test with Image",
    "body": "Has preview image"
  },
  "data": {
    "type": "highlight",
    "highlight_id": "test123",
    "image_url": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    "action_left": "watch",
    "action_left_label": "Watch",
    "action_right": "dismiss",
    "action_right_label": "Dismiss"
  }
}
```

**Expected:**
- Notification with large preview image
- Custom actions: [Watch] [Watch Later] [Dismiss]

## Console Logs

### When Notification Arrives
```
📬 Foreground message received!
📬 Title: New Match Highlight
📬 Body: NEWCASTLE 2-3 EVERTON
📬 Data: {type: highlight, image_url: https://..., action_left: watch, ...}
🔔 Showing local notification: New Match Highlight
🔔 Notification data: {type: highlight, ...}
📸 Image URL: https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
📸 Loading notification image: https://...
✅ Image loaded successfully
🎯 Created 3 notification actions
✅ Local notification displayed successfully
```

### When Action Tapped
```
📱 Local notification tapped: {...}
📱 Action ID: watch
📱 Type: highlight, Action: watch
Opening highlight: 69a4037104d8e22f86405b98
```

### When "Watch Later" Tapped
```
📱 Local notification tapped: {...}
📱 Action ID: watch_later
📱 Type: highlight, Action: watch_later
💾 Saved item for later
```

## Troubleshooting

### Issue: Notification Not Showing

**Check:**
1. Console logs for errors
2. FCM token is valid
3. Topic subscription is correct
4. Notification permission granted

**Debug:**
```
📬 Foreground message received!  ← Should see this
🔔 Showing local notification   ← Should see this
✅ Local notification displayed  ← Should see this
```

If you don't see these logs, the notification isn't reaching the app.

### Issue: Image Not Loading

**Check:**
1. Image URL is valid and accessible
2. Image URL is not "VIDEO_ID" (placeholder)
3. Image is under 1MB
4. URL uses HTTPS

**Debug:**
```
📸 Image URL: https://...        ← Check this URL
📸 Loading notification image    ← Should see this
✅ Image loaded successfully     ← Should see this
```

If image fails:
```
⚠️ Image load failed with status: 404
```
or
```
⚠️ Error loading notification image: [error]
```

### Issue: Actions Not Working

**Check:**
1. Action IDs are correct
2. Action labels are provided
3. Notification channel is created

**Debug:**
```
🎯 Created 3 notification actions  ← Should see this
📱 Action ID: watch               ← When tapped
```

## Backend Implementation Example (Go)

```go
func (h *Handler) sendHighlightNotification(highlight *Highlight) error {
    videoID := extractYouTubeID(highlight.VideoURL)
    imageURL := fmt.Sprintf("https://img.youtube.com/vi/%s/maxresdefault.jpg", videoID)
    
    message := &messaging.Message{
        Topic: fmt.Sprintf("club_%s", highlight.ClubID),
        Notification: &messaging.Notification{
            Title: "New Match Highlight",
            Body:  highlight.MatchTitle,
        },
        Android: &messaging.AndroidConfig{
            Notification: &messaging.AndroidNotification{
                ImageURL:    imageURL,
                ClickAction: "FLUTTER_NOTIFICATION_CLICK",
            },
        },
        Data: map[string]string{
            "type":              "highlight",
            "highlight_id":      highlight.ID,
            "video_url":         highlight.VideoURL,
            "image_url":         imageURL,
            "club_id":           highlight.ClubID,
            "action_left":       "watch",
            "action_left_label": "Watch",
            "action_right":      "dismiss",
            "action_right_label": "Dismiss",
        },
    }
    
    _, err := h.fcmClient.Send(context.Background(), message)
    return err
}

func (h *Handler) sendNewsNotification(news *News) error {
    message := &messaging.Message{
        Topic: fmt.Sprintf("club_%s", news.ClubID),
        Notification: &messaging.Notification{
            Title: fmt.Sprintf("New news from %s", news.ClubName),
            Body:  news.Title,
        },
        Android: &messaging.AndroidConfig{
            Notification: &messaging.AndroidNotification{
                ImageURL:    news.ImageURL,
                ClickAction: "FLUTTER_NOTIFICATION_CLICK",
            },
        },
        Data: map[string]string{
            "type":              "news",
            "content_id":        news.ID,
            "image_url":         news.ImageURL,
            "club_id":           news.ClubID,
            "action_left":       "read",
            "action_left_label": "Read",
            "action_right":      "dismiss",
            "action_right_label": "Dismiss",
        },
    }
    
    _, err := h.fcmClient.Send(context.Background(), message)
    return err
}
```

## Quick Test Commands

### Test with cURL
```bash
# Replace YOUR_PROJECT and YOUR_TOKEN
curl -X POST https://fcm.googleapis.com/v1/projects/YOUR_PROJECT/messages:send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "topic": "club_69936a49b2702c6a00284d48",
      "notification": {
        "title": "Test Highlight",
        "body": "NEWCASTLE 2-3 EVERTON"
      },
      "android": {
        "notification": {
          "image_url": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
        }
      },
      "data": {
        "type": "highlight",
        "highlight_id": "test123",
        "image_url": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
        "action_left": "watch",
        "action_left_label": "Watch",
        "action_right": "dismiss",
        "action_right_label": "Dismiss"
      }
    }
  }'
```

## Summary

- ✅ Dynamic action buttons from backend
- ✅ Flexible image URL handling
- ✅ Automatic "Watch Later" / "Read Later"
- ✅ Custom action labels
- ✅ Graceful fallbacks
- ✅ Comprehensive logging

The system is now fully dynamic and controlled by the backend payload!
