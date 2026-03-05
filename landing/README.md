# FanZone Landing Page 🚀

A comprehensive, modern, and feature-rich landing page for the FanZone football fan engagement platform. Built with Next.js 15, TypeScript, Tailwind CSS, and Framer Motion.

## ✨ Features

### Design & UI
- **Modern Dark Theme** with gradient accents (blue, purple, pink)
- **Animated Background Elements** with floating orbs
- **Glass Morphism Effects** throughout the design
- **Smooth Scroll Navigation** with fixed header
- **Fully Responsive** design for all devices (mobile, tablet, desktop)
- **Custom Animations** using Framer Motion
- **Gradient Borders** and animated gradients
- **Custom Scrollbar** styling

### Sections
1. **Hero Section** - Eye-catching introduction with animated cards
2. **Stats Counter** - Animated statistics (500K+ users, 150+ clubs, etc.)
3. **Features Grid** - 9 feature cards with unique gradients and icons
4. **How It Works** - 3-step process with visual indicators
5. **Leagues Coverage** - Grid of supported football leagues
6. **Testimonials** - User reviews with ratings
7. **Pricing Plans** - Free, Pro, and Premium tiers
8. **FAQ Section** - Expandable accordion with common questions
9. **CTA Section** - Call-to-action with app store buttons
10. **Newsletter** - Email subscription form
11. **Footer** - Comprehensive footer with links and social media

### Interactive Elements
- Mobile-responsive navigation menu
- Animated section reveals on scroll
- Hover effects on cards and buttons
- Expandable FAQ items
- Scroll-to-top button
- Animated counters for statistics

## 🛠 Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Beautiful icon set
- **clsx & tailwind-merge** - Utility for conditional classes

## 📦 Installation

```bash
# Navigate to the landing directory
cd landing

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.

## 📁 Project Structure

```
landing/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main landing page
│   └── globals.css         # Global styles and animations
├── components/
│   ├── AnimatedSection.tsx # Scroll-reveal animation wrapper
│   └── StatsCounter.tsx    # Animated number counter
├── lib/
│   └── utils.ts            # Utility functions (cn helper)
├── public/                 # Static assets
└── package.json
```

## 🎨 Customization Guide

### Colors & Gradients
The landing page uses a consistent color scheme. To customize:
- Primary: Blue (#3b82f6)
- Secondary: Purple (#8b5cf6)
- Accent: Pink (#ec4899)

Modify gradients in `app/globals.css` and component classes.

### Content Updates
1. **Hero Section** - Update title, description in `app/page.tsx`
2. **Stats** - Modify numbers in StatsCounter components
3. **Features** - Edit FeatureCard components with your features
4. **Leagues** - Add/remove LeagueCard components
5. **Testimonials** - Update TestimonialCard with real reviews
6. **Pricing** - Adjust PricingCard features and prices
7. **FAQ** - Add/edit FAQItem components

### App Store Links
Update the download links in:
- Hero section CTA buttons
- CTA section download buttons

Replace `href="#"` with actual App Store and Google Play URLs.

### Admin Dashboard Link
Update the admin login link in the navigation:
```tsx
<Link href="/admin">  // Change to your dashboard URL
```

### Social Media Links
Update social media links in the footer section.

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Other Platforms
The landing page can be deployed to:
- Netlify
- AWS Amplify
- Cloudflare Pages
- Any platform supporting Next.js

## 🎯 Performance Features

- Server-side rendering (SSR)
- Optimized images and assets
- Code splitting
- Lazy loading for animations
- Minimal bundle size
- Fast page loads

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🔧 Development Tips

1. **Hot Reload** - Changes reflect instantly in dev mode
2. **TypeScript** - Full type safety throughout
3. **Component Reusability** - All sections use reusable components
4. **Animation Performance** - Framer Motion optimized for 60fps
5. **Accessibility** - Semantic HTML and ARIA labels

## 📄 License

Proprietary - All rights reserved

## 🤝 Support

For issues or questions, contact the development team.

---

Built with ❤️ for football fans worldwide
