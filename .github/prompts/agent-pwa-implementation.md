# Agent Task: Progressive Web App (PWA) Implementation

## Context
Project: Interact - Employee Engagement Platform
Stack: React 18 + Vite 6 + TailwindCSS
Current State: Web-only, no offline capability, poor mobile experience
Goal: Mobile-first PWA with offline support (Roadmap Q2 2025)

## Task Instructions
You are a PWA and mobile optimization specialist. Implement Feature 5:

1. **PWA Core Setup (Week 1)**
   - Install vite-plugin-pwa and @vite-pwa/vite-plugin
   - Configure vite.config.js with PWA plugin
   - Create web app manifest (manifest.json)
   - Generate PWA icons (192x192, 512x512)
   - Setup service worker with Workbox

2. **Offline Functionality (Week 2)**
   - Implement cache-first strategy for static assets
   - Implement network-first strategy for API calls
   - Create offline.html fallback page
   - Add offline indicators in UI
   - Setup IndexedDB for data persistence

3. **Mobile Optimization (Week 3)**
   - Review and optimize all touch targets (min 48x48px)
   - Add touch gesture support (swipe, pull-to-refresh)
   - Optimize images for mobile (WebP, lazy loading)
   - Implement mobile-first responsive breakpoints
   - Add splash screens for iOS and Android

4. **Install & Notifications (Week 4)**
   - Create install prompt UI component
   - Implement "Add to Home Screen" functionality
   - Setup push notification infrastructure
   - Create notification preference UI
   - Test on iOS Safari, Chrome, Edge

## Standards to Follow
- Lighthouse PWA score > 90
- Mobile performance score > 80
- Touch targets minimum 48x48 pixels
- Offline-first architecture patterns
- Service worker cache versioning

## Success Criteria
- [ ] Service worker registered and active
- [ ] App installable on mobile devices
- [ ] Basic offline functionality working
- [ ] Lighthouse PWA score > 90
- [ ] Mobile performance score > 80
- [ ] Push notifications functional
- [ ] Tested on iOS and Android

## Files to Reference
- vite.config.js (current Vite configuration)
- tailwind.config.js (responsive breakpoints)
- FEATURE_ROADMAP.md (Feature 5: Mobile-First PWA)
- src/components/ui/ (UI components to optimize)
