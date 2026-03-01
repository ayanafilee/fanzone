# Rich Notifications - Backend Integration Guide

## Overview
The mobile app now supports YouTube-style rich notifications with:
- Large preview images (expandable)
- Action buttons (Watch/Read, Watch Later/Read Later, Turn Off)
- Better visual presentation

## Required Changes to Backend Notification Payload

### Current Format (Basic)
```json
{
  "notification": {
    "title": "New Match Highlight",
    "body": "NEWCASTLE 2-3 EVERTON | Premier League highlights"
  },
  "data": {
    "type": "highlight",
    "highlight_id": "69a4037104d8e22f86405b98",
    "club_id": "69936a49b2702c6a00284d48",
    "club_name": "Newcastle United",
    "match_title": "NEWCASTLE 2-3 EVERTON | Premier League highlights"
  }
}
```

### New Format (Rich Notifications)
```json
{
  "notification": {
    "title": "New Match Highlight",
    "body": "NEWCASTLE 2-3 EVERTON | Premier League highlights",
    "android": {
      "image": "https://your-cdn.com/thumbnails/highlight-thumbnail.jpg"
    }
  },
  "data": {
    "type": "highlight",
    "highlight_id": "69a4037104d8e22f86405b98",
    "club_id": "69936a49b2702c6a00284d48",
    "club_name": "Newcastle United",
    "match_title": "NEWCASTLE 2-3 EVERTON | Premier League highlights",
    "image_url": "https://your-cdn.com/thumbnails/highlight-thumbnail.jpg"
  }
}
```

## Key Changes

### 1. Add Image URL
Include the thumbnail/preview image in TWO places:
- `notification.android.image` - For system notifications (background/terminated)
- `data.image_url` - For custom notifications (foreground)

### 2. For Highlights
```json
{
  "notification": {
    "title": "New Match Highlight",
    "body": "NEWCASTLE 2-3 EVERTON | Premier League highlights",
    "android": {
      "image": "https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg"
    }
  },
  "data": {
    "type": "highlight",
    "highlight_id": "69a4037104d8e22f86405b98",
    "club_id": "69936a49b2702c6a00284d48",
    "club_name": "Newcastle United",
    "match_title": "NEWCASTLE 2-3 EVERTON | Premier League highlights",
    "video_url": "https://youtube.com/watch?v=VIDEO_ID",
    "image_url": "https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg"
  }
}
```

### 3. For News
```json
{
  "notification": {
    "title": "Breaking News",
    "body": "Newcastle United signs new striker",
    "android": {
      "image": "https://your-cdn.com/news/news-image.jpg"
    }
  },
  "data": {
    "type": "news",
    "content_id": "news123",
    "club_id": "69936a49b2702c6a00284d48",
    "club_name": "Newcastle United",
    "title": "Breaking News",
    "body": "Newcastle United signs new striker",
    "image_url": "https://your-cdn.com/news/news-image.jpg"
  }
}
```

## Image Requirements

### YouTube Thumbnails
For YouTube videos, use these URL formats:
- High quality: `https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg`
- Medium quality: `https://img.youtube.com/vi/VIDEO_ID/hqdefault.jpg`
- Standard: `https://img.youtube.com/vi/VIDEO_ID/sddefault.jpg`

### Custom Images
- Format: JPG or PNG
- Recommended size: 1280x720 (16:9 aspect ratio)
- Max file size: 1MB
- Must be publicly accessible (HTTPS)

## How It Works

### Notification States

#### 1. Foreground (App Open)
- App downloads image
- Shows custom notification with big picture style
- Displays action buttons:
  - Highlights: "Watch", "Watch Later", "Turn Off"
  - News: "Read", "Read Later", "Turn Off"

#### 2. Background/Terminated (App Closed)
- Android system shows notification
- Uses `notification.android.image` for preview
- System handles display automatically

### Action Buttons

#### Watch / Read
- Opens the content immediately
- Takes user to detail screen

#### Watch Later / Read Later
- Saves item to "Saved for Later" list
- User can access from Settings → Saved for Later
- Dismisses notification

#### Turn Off
- Simply dismisses the notification
- No further action

## Backend Implementation Example (Go)

### Update Highlight Notification Function
```go
func (h *Handler) notifyHighlight(highlight *models.Highlight) error {
    // Extract YouTube video ID
    videoID := extractYouTubeID(highlight.VideoURL)
    thumbnailURL := fmt.Sprintf("https://img.youtube.com/vi/%s/maxresdefault.jpg", videoID)
    
    for _, clubID := range highlight.ClubIDs {
        club, err := h.clubService.GetClubByID(clubID)
        if err != nil {
            continue
        }
        
        topic := fmt.Sprintf("club_%s", clubID)
        
        message := &messaging.Message{
            Topic: topic,
            Notification: &messaging.Notification{
                Title: "New Match Highlight",
                Body:  highlight.MatchTitle,
                ImageURL: thumbnailURL, // Add this
            },
            Android: &messaging.AndroidConfig{
                Notification: &messaging.AndroidNotification{
                    ImageURL: thumbnailURL, // Add this
                },
            },
            Data: map[string]string{
                "type":         "highlight",
                "highlight_id": highlight.ID,
                "club_id":      clubID,
                "club_name":    club.Name,
                "match_title":  highlight.MatchTitle,
                "video_url":    highlight.VideoURL,
                "image_url":    thumbnailURL, // Add this
            },
        }
        
        _, err = h.fcmClient.Send(context.Background(), message)
        if err != nil {
            log.Printf("Error sending notification: %v", err)
        }
    }
    
    return nil
}
```

### Update News Notification Function
```go
func (h *Handler) notifyNews(content *models.Content) error {
    topic := fmt.Sprintf("club_%s", content.ClubID)
    
    message := &messaging.Message{
        Topic: topic,
        Notification: &messaging.Notification{
            Title:    content.Title["en"],
            Body:     content.Body["en"],
            ImageURL: content.ImageURL, // Add this
        },
        Android: &messaging.AndroidConfig{
            Notification: &messaging.AndroidNotification{
                ImageURL: content.ImageURL, // Add this
            },
        },
        Data: map[string]string{
            "type":       "news",
            "content_id": content.ID,
            "club_id":    content.ClubID,
            "title":      content.Title["en"],
            "body":       content.Body["en"],
            "image_url":  content.ImageURL, // Add this
        },
    }
    
    _, err := h.fcmClient.Send(context.Background(), message)
    return err
}
```

### Helper Function for YouTube ID
```go
func extractYouTubeID(url string) string {
    // Extract video ID from various YouTube URL formats
    patterns := []string{
        `(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)`,
        `youtube\.com\/embed\/([^&\n?#]+)`,
    }
    
    for _, pattern := range patterns {
        re := regexp.MustCompile(pattern)
        matches := re.FindStringSubmatch(url)
        if len(matches) > 1 {
            return matches[1]
        }
    }
    
    return ""
}
```

## Testing

### Test Payload (cURL)
```bash
curl -X POST https://fcm.googleapis.com/v1/projects/YOUR_PROJECT/messages:send \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "topic": "club_69936a49b2702c6a00284d48",
      "notification": {
        "title": "Test Highlight",
        "body": "NEWCASTLE 2-3 EVERTON",
        "image": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
      },
      "data": {
        "type": "highlight",
        "highlight_id": "test123",
        "club_id": "69936a49b2702c6a00284d48",
        "match_title": "NEWCASTLE 2-3 EVERTON",
        "image_url": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
      }
    }
  }'
```

## Expected Mobile Behavior

### When Notification Arrives (App Open)
```
📬 Foreground message received!
📬 Title: New Match Highlight
📬 Body: NEWCASTLE 2-3 EVERTON | Premier League highlights
📬 Data: {type: highlight, image_url: https://...}
📸 Loading notification image: https://...
✅ Image loaded successfully
🔔 Showing local notification: New Match Highlight
✅ Local notification displayed successfully
```

### User Experience
1. Notification appears with large preview image
2. User swipes down to see full image
3. Three action buttons appear:
   - "Watch" - Opens video immediately
   - "Watch Later" - Saves to list
   - "Turn Off" - Dismisses

## Backward Compatibility

The app will work with or without images:
- If `image_url` is provided → Shows rich notification with image
- If `image_url` is missing → Shows standard notification without image
- Action buttons work in both cases

## Checklist for Backend Team

- [ ] Add `image_url` to data payload
- [ ] Add `notification.android.image` for system notifications
- [ ] For YouTube videos, generate thumbnail URL from video ID
- [ ] For news, use existing image URL from content
- [ ] Ensure images are publicly accessible (HTTPS)
- [ ] Test with both foreground and background states
- [ ] Verify image loads correctly in notification

## Questions?

If you need help implementing this on the backend, let me know!
