# Rich Notification UI Mockup

## Visual Guide to New Notification Experience

### 1. Collapsed Notification (Initial State)

```
┌─────────────────────────────────────────────┐
│ 🔔 FanZone                    🕐 2m ago     │
│                                             │
│ New Match Highlight                         │
│ NEWCASTLE 2-3 EVERTON | Premier League     │
│                                             │
│ ▼ Swipe down to expand                     │
└─────────────────────────────────────────────┘
```

### 2. Expanded Notification (After Swipe Down)

```
┌─────────────────────────────────────────────┐
│ 🔔 FanZone                    🕐 2m ago     │
│                                             │
│ New Match Highlight                         │
│ NEWCASTLE 2-3 EVERTON | Premier League     │
│ highlights                                  │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │                                         │ │
│ │                                         │ │
│ │      [LARGE PREVIEW IMAGE]              │ │
│ │      Match Thumbnail                    │ │
│ │                                         │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│  [  Watch  ] [Watch Later] [Turn Off]      │
│                                             │
└─────────────────────────────────────────────┘
```

### 3. Action Buttons Detail

#### For Highlights
```
┌──────────────────────────────────────────────┐
│                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │  ▶ Watch │ │ 🔖 Watch │ │ ✕ Turn   │    │
│  │          │ │   Later  │ │   Off    │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│                                              │
└──────────────────────────────────────────────┘
```

#### For News
```
┌──────────────────────────────────────────────┐
│                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │  📰 Read │ │ 🔖 Read  │ │ ✕ Turn   │    │
│  │          │ │   Later  │ │   Off    │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│                                              │
└──────────────────────────────────────────────┘
```

## Settings Screen - New Section

```
┌─────────────────────────────────────────────┐
│ ← Settings                                  │
├─────────────────────────────────────────────┤
│                                             │
│ My Club                                     │
│ ⚽ Select your favorite club                │
│                                             │
│ [Grid of clubs...]                          │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│ 🔖 Saved for Later                    →    │
│    View items you saved from                │
│    notifications                            │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│ 🚪 Logout                                   │
│                                             │
└─────────────────────────────────────────────┘
```

## Saved for Later Screen

```
┌─────────────────────────────────────────────┐
│ ← Saved for Later                           │
├─────────────────────────────────────────────┤
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ ▶  NEWCASTLE 2-3 EVERTON                │ │
│ │    Highlight                             │ │
│ │                          [Open] [Remove] │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 📰 Transfer News Update                 │ │
│ │    News                                  │ │
│ │                          [Open] [Remove] │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ ▶  ARSENAL 1-0 CHELSEA                  │ │
│ │    Highlight                             │ │
│ │                          [Open] [Remove] │ │
│ └─────────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

## Empty State - Saved for Later

```
┌─────────────────────────────────────────────┐
│ ← Saved for Later                           │
├─────────────────────────────────────────────┤
│                                             │
│                                             │
│                                             │
│              🔖                             │
│                                             │
│         No saved items                      │
│                                             │
│   Tap "Watch Later" or "Read Later"        │
│   on notifications to save items here      │
│                                             │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

## User Flow Diagram

```
Notification Arrives
        ↓
User sees collapsed notification
        ↓
User swipes down
        ↓
Large preview image appears
        ↓
User sees 3 action buttons
        ↓
    ┌───┴───┬────────────┐
    ↓       ↓            ↓
  Watch   Watch Later  Turn Off
    ↓       ↓            ↓
  Opens   Saves to    Dismisses
  Content   List
            ↓
    Accessible from
    Settings → Saved for Later
```

## Comparison: Before vs After

### Before (Basic Notification)
```
┌─────────────────────────────────┐
│ 🔔 FanZone                      │
│ New Match Highlight             │
│ NEWCASTLE 2-3 EVERTON          │
│                                 │
│ [Tap to open]                  │
└─────────────────────────────────┘
```

### After (Rich Notification)
```
┌─────────────────────────────────┐
│ 🔔 FanZone                      │
│ New Match Highlight             │
│ NEWCASTLE 2-3 EVERTON          │
│                                 │
│ ┌─────────────────────────────┐ │
│ │   [LARGE PREVIEW IMAGE]     │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Watch] [Watch Later] [Turn Off]│
└─────────────────────────────────┘
```

## Real-World Example

### YouTube Notification (Reference)
```
┌─────────────────────────────────┐
│ 📺 YouTube                      │
│ New video from Channel Name     │
│ Video Title Here                │
│                                 │
│ ┌─────────────────────────────┐ │
│ │   [Video Thumbnail]         │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Watch] [Save] [Not interested] │
└─────────────────────────────────┘
```

### FanZone Notification (Our Implementation)
```
┌─────────────────────────────────┐
│ 🔔 FanZone                      │
│ New Match Highlight             │
│ NEWCASTLE 2-3 EVERTON          │
│                                 │
│ ┌─────────────────────────────┐ │
│ │   [Match Thumbnail]         │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Watch] [Watch Later] [Turn Off]│
└─────────────────────────────────┘
```

## Color Scheme

```
Background:        Dark gradient (existing app theme)
Text:              White / White70
Action Buttons:    
  - Primary:       Green gradient (Watch/Read)
  - Secondary:     Gray (Watch Later/Read Later)
  - Dismiss:       Red tint (Turn Off)
Icons:             White
Preview Image:     Full width, 16:9 aspect ratio
```

## Interaction States

### Button States
```
Normal:    [  Watch  ]
Pressed:   [▼ Watch ▼]
Disabled:  [  Watch  ] (grayed out)
```

### Notification States
```
Unread:    Bold title, bright colors
Read:      Normal weight, slightly dimmed
Saved:     Bookmark icon visible
Dismissed: Removed from notification tray
```

## Accessibility

- All buttons have descriptive labels
- Images have alt text
- High contrast for text
- Touch targets minimum 48x48dp
- Screen reader support

## Animation

```
Notification appears:  Slide down from top
Expand:               Smooth height transition
Image load:           Fade in
Button tap:           Scale down slightly
Dismiss:              Slide up and fade out
```

This visual guide shows exactly how the rich notifications will look and behave!
