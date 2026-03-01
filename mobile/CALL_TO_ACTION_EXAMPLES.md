# Call to Action - Complete Examples

## Overview
Both highlights and news notifications support the same dynamic call-to-action system. The backend controls the action buttons through the payload.

## How It Works

The app creates **3 action buttons** for every notification:
1. **Left Button** (from backend) - Primary action
2. **Middle Button** (automatic) - Save for later
3. **Right Button** (from backend) - Secondary action

## Highlight Notification Example

### Backend Payload
```json
{
  "topic": "club_69936a49b2702c6a00284d48",
  "notification": {
    "title": "New Match Highlight",
    "body": "NEWCASTLE 2-3 EVERTON | Premier League highlights"
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
    "club_id": "69936a49b2702c6a00284d48",
    "club_name": "Newcastle United",
    "match_title": "NEWCASTLE 2-3 EVERTON | Premier League highlights",
    "action_left": "watch",
    "action_left_label": "Watch",
    "action_right": "dismiss",
    "action_right_label": "Dismiss"
  }
}
```

### Result on Device
```
┌─────────────────────────────────────────────┐
│ 🔔 FanZone                    🕐 2m ago     │
│                                             │
│ New Match Highlight                         │
│ NEWCASTLE 2-3 EVERTON | Premier League     │
│ highlights                                  │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │   [Large Match Thumbnail Image]         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│  [Watch] [Watch Later] [Dismiss]           │
│                                             │
└─────────────────────────────────────────────┘
```

### Action Behaviors

**[Watch]** (action_left)
- Opens video immediately
- Takes user to highlight player
- Dismisses notification

**[Watch Later]** (automatic)
- Saves highlight to "Saved for Later" list
- Dismisses notification
- Accessible from Settings → Saved for Later

**[Dismiss]** (action_right)
- Simply dismisses notification
- No further action

## News Notification Example

### Backend Payload
```json
{
  "topic": "club_69936922b2702c6a00284d3c",
  "notification": {
    "title": "New news from Arsenal FC",
    "body": "Big Win Today - Arsenal defeats rivals 3-1"
  },
  "android": {
    "notification": {
      "image_url": "https://your-cdn.com/news/arsenal-win.jpg",
      "click_action": "FLUTTER_NOTIFICATION_CLICK"
    }
  },
  "data": {
    "type": "news",
    "content_id": "news_abc123",
    "image_url": "https://your-cdn.com/news/arsenal-win.jpg",
    "club_id": "69936922b2702c6a00284d3c",
    "club_name": "Arsenal FC",
    "title": "Big Win Today",
    "body": "Arsenal defeats rivals 3-1",
    "action_left": "read",
    "action_left_label": "Read",
    "action_right": "dismiss",
    "action_right_label": "Dismiss"
  }
}
```

### Result on Device
```
┌─────────────────────────────────────────────┐
│ 🔔 FanZone                    🕐 5m ago     │
│                                             │
│ New news from Arsenal FC                    │
│ Big Win Today - Arsenal defeats rivals 3-1 │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │   [Large News Article Image]            │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│  [Read] [Read Later] [Dismiss]             │
│                                             │
└─────────────────────────────────────────────┘
```

### Action Behaviors

**[Read]** (action_left)
- Opens article immediately
- Takes user to news detail screen
- Dismisses notification

**[Read Later]** (automatic)
- Saves article to "Saved for Later" list
- Dismisses notification
- Accessible from Settings → Saved for Later

**[Dismiss]** (action_right)
- Simply dismisses notification
- No further action

## Custom Action Labels

You can customize the button labels for different contexts:

### Example 1: Urgent Highlight
```json
{
  "data": {
    "type": "highlight",
    "action_left": "watch",
    "action_left_label": "Watch Now",
    "action_right": "dismiss",
    "action_right_label": "Not Interested"
  }
}
```

**Result:** `[Watch Now] [Watch Later] [Not Interested]`

### Example 2: Breaking News
```json
{
  "data": {
    "type": "news",
    "action_left": "read",
    "action_left_label": "Read Article",
    "action_right": "dismiss",
    "action_right_label": "Skip"
  }
}
```

**Result:** `[Read Article] [Read Later] [Skip]`

### Example 3: Live Match
```json
{
  "data": {
    "type": "highlight",
    "action_left": "watch",
    "action_left_label": "Watch Live",
    "action_right": "dismiss",
    "action_right_label": "Remind Me"
  }
}
```

**Result:** `[Watch Live] [Watch Later] [Remind Me]`

## Minimal Payload (Still Works!)

If you don't provide custom actions, the app uses defaults:

### Highlight (Minimal)
```json
{
  "notification": {
    "title": "New Match Highlight",
    "body": "NEWCASTLE 2-3 EVERTON"
  },
  "data": {
    "type": "highlight",
    "highlight_id": "test123"
  }
}
```

**Result:** `[Watch Later]` (only middle button, no left/right)

### News (Minimal)
```json
{
  "notification": {
    "title": "New news from Arsenal FC",
    "body": "Big Win Today"
  },
  "data": {
    "type": "news",
    "content_id": "news123"
  }
}
```

**Result:** `[Read Later]` (only middle button, no left/right)

## Action Button Logic

### Left Button (Primary Action)
- **Required fields:** `action_left`, `action_left_label`
- **Common values:** "watch", "read", "open", "view"
- **Behavior:** Opens content immediately
- **Shows UI:** Yes (opens app screen)

### Middle Button (Save for Later)
- **Automatic:** Based on `type` field
- **For highlights:** "Watch Later"
- **For news:** "Read Later"
- **Behavior:** Saves to list, dismisses notification
- **Shows UI:** No (background action)

### Right Button (Secondary Action)
- **Required fields:** `action_right`, `action_right_label`
- **Common values:** "dismiss", "skip", "not_interested"
- **Behavior:** Dismisses notification
- **Shows UI:** No (just dismisses)

## Console Logs

### When Highlight Notification Arrives
```
📬 Foreground message received!
📬 Title: New Match Highlight
📬 Body: NEWCASTLE 2-3 EVERTON | Premier League highlights
📬 Data: {type: highlight, highlight_id: 69a4037104d8e22f86405b98, action_left: watch, ...}
🔔 Showing local notification: New Match Highlight
🔔 Notification data: {type: highlight, ...}
📸 Image URL: https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
📸 Loading notification image: https://...
✅ Image loaded successfully
🎯 Created 3 notification actions
✅ Local notification displayed successfully
```

### When "Watch" Button Tapped
```
📱 Local notification tapped: {...}
📱 Action ID: watch
📱 Type: highlight, Action: watch
Opening highlight: 69a4037104d8e22f86405b98
```

### When "Watch Later" Button Tapped
```
📱 Local notification tapped: {...}
📱 Action ID: watch_later
📱 Type: highlight, Action: watch_later
💾 Saved item for later
```

### When News Notification Arrives
```
📬 Foreground message received!
📬 Title: New news from Arsenal FC
📬 Body: Big Win Today
📬 Data: {type: news, content_id: news123, action_left: read, ...}
🔔 Showing local notification: New news from Arsenal FC
🔔 Notification data: {type: news, ...}
📸 Image URL: https://your-cdn.com/news/image.jpg
📸 Loading notification image: https://...
✅ Image loaded successfully
🎯 Created 3 notification actions
✅ Local notification displayed successfully
```

### When "Read" Button Tapped
```
📱 Local notification tapped: {...}
📱 Action ID: read
📱 Type: news, Action: read
Opening news: news123
```

## Testing Both Types

### Test 1: Highlight with Actions
```bash
# Send this payload
{
  "topic": "all_users",
  "notification": {
    "title": "Test Highlight",
    "body": "NEWCASTLE 2-3 EVERTON"
  },
  "data": {
    "type": "highlight",
    "highlight_id": "test123",
    "action_left": "watch",
    "action_left_label": "Watch",
    "action_right": "dismiss",
    "action_right_label": "Dismiss"
  }
}
```

**Expected:** `[Watch] [Watch Later] [Dismiss]`

### Test 2: News with Actions
```bash
# Send this payload
{
  "topic": "all_users",
  "notification": {
    "title": "Test News",
    "body": "Big Win Today"
  },
  "data": {
    "type": "news",
    "content_id": "news123",
    "action_left": "read",
    "action_left_label": "Read",
    "action_right": "dismiss",
    "action_right_label": "Dismiss"
  }
}
```

**Expected:** `[Read] [Read Later] [Dismiss]`

## Summary

### ✅ Both Highlights and News Support:
- Dynamic action buttons from backend
- Custom action labels
- Image previews
- Save for later functionality
- Identical implementation

### 📋 Required Fields:
- `notification.title` - Notification title
- `notification.body` - Notification body
- `data.type` - "highlight" or "news"
- `data.highlight_id` or `data.content_id` - Content identifier

### 🎨 Optional Fields (for better UX):
- `data.image_url` - Preview image
- `data.action_left` - Primary action ID
- `data.action_left_label` - Primary action label
- `data.action_right` - Secondary action ID
- `data.action_right_label` - Secondary action label

### 🎯 Action Button Pattern:
```
[Primary Action] [Save for Later] [Secondary Action]
     ↑                  ↑                  ↑
  From backend      Automatic         From backend
```

Both highlights and news work exactly the same way!
