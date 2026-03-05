# Styling Fix for FanZone Landing Page

## Problem
Tailwind CSS v4 handles arbitrary color values differently than v3. The bracket notation like `bg-[#0A1F1A]` wasn't working correctly with the new version.

## Solution
We implemented a hybrid approach using:

1. **Inline Styles with React** - For complex gradients and dynamic colors
2. **CSS Custom Utilities** - For reusable classes in `globals.css`
3. **Centralized Style Constants** - In `lib/styles.ts` for consistency

## File Structure

### `/lib/styles.ts`
Contains all brand colors, gradients, and reusable style objects:
- `colors` - All FanZone brand colors matching the mobile app
- `gradients` - Pre-defined gradient strings
- `styles` - Common style objects (badges, glass effects, etc.)
- `getGradientTextStyle()` - Helper for gradient text

### `/app/globals.css`
- Uses `@import "tailwindcss"` for Tailwind v4
- Custom animations (float, gradient)
- Utility classes (glass-effect, gradient-border)
- Custom scrollbar styling

### `/app/page.tsx`
- Imports style constants from `lib/styles.ts`
- Uses inline `style` prop for gradients and colors
- Combines Tailwind utility classes with custom styles

## Usage Examples

### Gradient Button
```tsx
<button 
  className="px-8 py-4 rounded-xl text-white"
  style={{ background: gradients.button }}
>
  Click Me
</button>
```

### Gradient Text
```tsx
<span style={getGradientTextStyle()}>
  Gradient Text
</span>
```

### Badge with Brand Colors
```tsx
<div style={styles.badge}>
  <span style={{ color: colors.limeGreen }}>Badge Text</span>
</div>
```

### Glass Effect
```tsx
<div className="glass-effect p-6 rounded-xl">
  Content
</div>
```

## Benefits

1. **Consistency** - All colors defined in one place
2. **Type Safety** - TypeScript support for style objects
3. **Maintainability** - Easy to update brand colors
4. **Performance** - No runtime CSS generation
5. **Compatibility** - Works with Tailwind CSS v4

## Color Palette

- **Dark Green**: `#0A1F1A` - Main background
- **Medium Green**: `#1A3A2E` - Cards, inputs
- **Accent Green**: `#2D5F4C` - Borders, accents
- **Forest Green**: `#4A8B6F` - Mid-gradient
- **Lime Green**: `#B8D96E` - Highlights, CTAs

## Development

To run the development server:
```bash
cd landing
npm run dev
```

The landing page will be available at http://localhost:3000

## Build

To create a production build:
```bash
npm run build
npm start
```

All styling now works correctly with proper gradients, animations, and the FanZone green color scheme matching the mobile app!
