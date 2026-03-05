# FanZone Landing Page - Color Scheme

This document describes the color scheme used in the FanZone landing page, which matches the mobile app's design.

## Brand Colors (From Mobile App)

### Primary Green Palette
- **Dark Green**: `#0A1F1A` - Main background color
- **Medium Green**: `#1A3A2E` - Secondary background, cards, inputs
- **Accent Green**: `#2D5F4C` - Borders, hover states, accents
- **Forest Green**: `#4A8B6F` - Mid-gradient color
- **Lime Green**: `#B8D96E` - Highlight color, call-to-action

### Gradient Definitions

#### Background Gradient
```css
background: linear-gradient(to bottom, #0A1F1A, #0F2820, #0A1F1A);
```

#### Button Gradient
```css
background: linear-gradient(to right, #2D5F4C, #4A8B6F, #B8D96E);
```

#### Glass Effect
```css
background: rgba(26, 58, 46, 0.6);
backdrop-filter: blur(12px);
border: 1px solid rgba(45, 95, 76, 0.3);
```

## Color Usage Guide

### Backgrounds
- **Main Background**: `#0A1F1A` (Dark Green)
- **Section Alternating**: `#1A3A2E/30` (Medium Green with opacity)
- **Cards**: Glass effect with `#1A3A2E` base
- **Inputs**: `#1A3A2E` with `#2D5F4C` border

### Text
- **Primary Text**: White (`#FFFFFF`)
- **Secondary Text**: Slate 400 (`#94A3B8`)
- **Accent Text**: `#B8D96E` (Lime Green)

### Interactive Elements
- **Primary Buttons**: Gradient from `#2D5F4C` → `#4A8B6F` → `#B8D96E`
- **Secondary Buttons**: `#1A3A2E` background with hover to `#2D5F4C`
- **Links**: Slate 300 with white hover
- **Borders**: `#2D5F4C` with varying opacity

### Badges & Tags
- **Background**: `#2D5F4C/20` (20% opacity)
- **Border**: `#4A8B6F/30` (30% opacity)
- **Text**: `#B8D96E`

### Gradients for Features
All feature cards use variations of the green palette:
- `from-[#2D5F4C] to-[#4A8B6F]`
- `from-[#4A8B6F] to-[#B8D96E]`
- `from-[#B8D96E] to-[#4A8B6F]`
- `from-[#2D5F4C] to-[#B8D96E]`

## Tailwind CSS Custom Colors

The following custom colors are defined in `globals.css`:

```css
:root {
  --dark-green: 160 50% 8%;      /* #0A1F1A */
  --medium-green: 160 35% 16%;   /* #1A3A2E */
  --accent-green: 160 35% 28%;   /* #2D5F4C */
  --button-green-start: 160 35% 28%; /* #2D5F4C */
  --button-green-end: 73 55% 64%;    /* #B8D96E */
  --lime-green: 73 55% 64%;      /* #B8D96E */
  --card-green: 160 35% 20%;     /* #1E3D32 */
}
```

## Accessibility Notes

- All text maintains WCAG AA contrast ratios against backgrounds
- Interactive elements have clear hover states
- Focus states use the lime green (`#B8D96E`) for visibility
- Gradient text is used for decorative purposes only, not critical information

## Consistency with Mobile App

The landing page now perfectly matches the mobile app's color scheme:
- Same dark green background gradient
- Identical button gradients
- Matching card backgrounds
- Consistent accent colors throughout

This creates a cohesive brand experience across web and mobile platforms.
