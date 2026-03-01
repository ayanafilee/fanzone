# Visual Guide: Telegram-Style Reactions

## What Users See

### 1. News/Highlight Card (Feed View)

```
┌────────────────────────────────────────┐
│  [Image]                               │
│                                        │
│  Breaking News: Arsenal Wins!          │
│  Arsenal secured a 3-1 victory...     │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 👍 │ 👍❤️😮 127                  │ │ ← Compact Reaction Bar
│  └──────────────────────────────────┘ │
│                                        │
│  Mar 1, 2026        [Read More →]     │
└────────────────────────────────────────┘
```

### 2. News Detail Screen

```
┌────────────────────────────────────────┐
│  ← [Back]              [🔖] [Share]   │
│                                        │
│  [Large Image]                         │
│                                        │
│  Breaking News: Arsenal Wins!          │
│  Mar 1, 2026 • 3 min read            │
│  ────────────────────────────────     │
│                                        │
│  Full article text goes here...        │
│  Lorem ipsum dolor sit amet...         │
│  Consectetur adipiscing elit...        │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ ❤️2 👍 😮 reacting now          │ │ ← Recent Reactions
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 👍 Like  │  👍❤️😮 127          │ │ ← Full Reaction Bar
│  └──────────────────────────────────┘ │
│                                        │
│  [Share Article]  [🔖]                │
└────────────────────────────────────────┘
```

### 3. Reaction Picker (Bottom Sheet)

```
┌────────────────────────────────────────┐
│                                        │
│  [Content above]                       │
│                                        │
│  ╔══════════════════════════════════╗ │
│  ║                                  ║ │
│  ║  👍      ❤️      😮      😢      😠  ║ │
│  ║  Like   Love    Wow    Sad   Angry║ │
│  ║                                  ║ │
│  ╚══════════════════════════════════╝ │
└────────────────────────────────────────┘
```

### 4. Floating Animation Sequence

```
Frame 1 (0.0s):
┌────────────────────────────────────────┐
│  Article content...                    │
│                                        │
│  [Reaction Bar]                        │
│                                        │
│  ❤️ ← Just appeared                   │
└────────────────────────────────────────┘

Frame 2 (0.3s):
┌────────────────────────────────────────┐
│  Article content...                    │
│                                        │
│  [Reaction Bar]                        │
│     ❤️ ← Growing (1.5x)                │
│                                        │
└────────────────────────────────────────┘

Frame 3 (0.5s):
┌────────────────────────────────────────┐
│  Article content...                    │
│        ❤️ ← Floating up                │
│  [Reaction Bar]                        │
│                                        │
│                                        │
└────────────────────────────────────────┘

Frame 4 (1.0s):
┌────────────────────────────────────────┐
│           ❤️ ← Still floating          │
│  Article content...                    │
│                                        │
│  [Reaction Bar]                        │
│                                        │
└────────────────────────────────────────┘

Frame 5 (2.0s):
┌────────────────────────────────────────┐
│              💨 ← Faded away           │
│  Article content...                    │
│                                        │
│  [Reaction Bar]                        │
│                                        │
└────────────────────────────────────────┘
```

### 5. Multiple Reactions Floating

```
┌────────────────────────────────────────┐
│        ❤️     😮                       │
│     👍    ❤️                           │
│  ❤️                                    │
│                                        │
│  Article content...                    │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ ❤️3 👍 😮 reacting now          │ │
│  └──────────────────────────────────┘ │
│                                        │
│  [Reaction Bar]                        │
└────────────────────────────────────────┘
```

### 6. Reaction Details Modal

```
┌────────────────────────────────────────┐
│                                        │
│  ╔══════════════════════════════════╗ │
│  ║  Reactions                       ║ │
│  ║                                  ║ │
│  ║  👍  Like           45           ║ │
│  ║  ❤️  Love           23           ║ │
│  ║  😮  Wow            12           ║ │
│  ║  😢  Sad             3           ║ │
│  ║  😠  Angry           1           ║ │
│  ║                                  ║ │
│  ╚══════════════════════════════════╝ │
└────────────────────────────────────────┘
```

## User Interaction Flow

### Scenario 1: First Time Reaction

```
Step 1: User sees content
┌──────────────────────┐
│  [Content]           │
│  👍 Like  │  0       │ ← Not reacted yet
└──────────────────────┘

Step 2: User taps reaction button
┌──────────────────────┐
│  [Reaction Picker]   │
│  👍 ❤️ 😮 😢 😠      │ ← Picker appears
└──────────────────────┘

Step 3: User selects ❤️
┌──────────────────────┐
│  [Content]           │
│     ❤️ ← Floating    │
│  ❤️ Love  │  1       │ ← Updated!
└──────────────────────┘
```

### Scenario 2: Changing Reaction

```
Step 1: User has ❤️ active
┌──────────────────────┐
│  [Content]           │
│  ❤️ Love  │  23      │ ← Currently Love
└──────────────────────┘

Step 2: User taps and selects 👍
┌──────────────────────┐
│  [Content]           │
│     👍 ← Floating    │
│  👍 Like  │  46      │ ← Changed to Like
└──────────────────────┘
```

### Scenario 3: Removing Reaction

```
Step 1: User has 👍 active
┌──────────────────────┐
│  [Content]           │
│  👍 Like  │  46      │ ← Currently Like
└──────────────────────┘

Step 2: User taps and selects 👍 again
┌──────────────────────┐
│  [Content]           │
│  👍 Like  │  45      │ ← Removed (count -1)
└──────────────────────┘
```

## Animation Details

### Floating Animation Properties

```
Duration: 2000ms (2 seconds)
Path: Bottom → Top (-200px)
Scale: 0 → 1.5 → 1.0 → 0
Opacity: 1.0 → 0.0 (last 1 second)
Horizontal: Random offset ±50px
Curve: Elastic out (bouncy)
```

### Recent Reactions Display

```
Appears: When reaction added
Duration: 5 seconds
Max reactions: 10
Display: Top 3 most recent
Update: Real-time
Animation: Fade in/out
```

### Reaction Bar States

```
Default:     👍 Like  │  0
Active:      ❤️ Love  │  23  (green highlight)
Hover:       Scale 1.05
Tap:         Opens picker
Long press:  Opens picker
```

## Color Scheme

```
Background:        Dark green gradient
Reaction bar:      Semi-transparent green
Active reaction:   Bright green (#B8D96E)
Inactive:          White/Gray
Recent reactions:  Black with green border
Picker:            Dark green with shadow
```

## Responsive Behavior

### Mobile (Portrait)
```
┌──────────────┐
│  [Content]   │
│              │
│  [Reactions] │
│  Full width  │
└──────────────┘
```

### Tablet (Landscape)
```
┌────────────────────────────┐
│  [Content]                 │
│                            │
│  [Reactions]               │
│  Centered, max width       │
└────────────────────────────┘
```

## Accessibility

### Screen Reader Support
```
Reaction button: "Like button, 45 reactions"
Active reaction: "Love button, selected, 23 reactions"
Picker: "Select reaction: Like, Love, Wow, Sad, Angry"
```

### Keyboard Navigation
```
Tab: Move between reactions
Enter/Space: Select reaction
Escape: Close picker
```

## Performance Indicators

### Good Performance
```
✓ Animations smooth (60 FPS)
✓ No lag when scrolling
✓ Quick reaction updates
✓ Instant UI feedback
```

### Poor Performance
```
✗ Choppy animations
✗ Delayed reactions
✗ Slow picker opening
✗ UI freezes
```

## Summary

The visual design provides:
- **Clear feedback** - Users see immediate results
- **Engaging animations** - Floating emojis are fun
- **Social proof** - "Reacting now" shows activity
- **Easy interaction** - Simple tap to react
- **Beautiful UI** - Matches app theme

Users will love the Telegram-style reactions! 🎉
