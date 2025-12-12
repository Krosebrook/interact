# INTERACT DESIGN SYSTEM

## Brand Identity

### Color Palette

#### Primary Colors
```css
--int-navy: #14294D      /* Primary brand color - headers, important text */
--int-orange: #D97230    /* Accent/CTA color - buttons, highlights */
--int-gold: #F5C16A      /* Secondary accent - badges, success states */
--int-teal: #2DD4BF      /* Tertiary accent - links, info */
```

#### Activity Type Colors
```css
--activity-icebreaker: #3B82F6   /* Blue */
--activity-creative: #8B5CF6     /* Purple */
--activity-competitive: #F59E0B   /* Amber */
--activity-wellness: #10B981     /* Green */
--activity-learning: #06B6D4     /* Cyan */
--activity-social: #EC4899       /* Pink */
```

#### Semantic Colors
```css
--success: #10B981
--warning: #F59E0B
--error: #EF4444
--info: #3B82F6
```

#### Neutral Palette
```css
--slate-50: #F8FAFC
--slate-100: #F1F5F9
--slate-200: #E2E8F0
--slate-600: #475569
--slate-900: #0F172A
```

---

## Typography

### Font System
```css
--font-display: 'Inter', system-ui, sans-serif;  /* Headings */
--font-body: 'Inter', system-ui, sans-serif;     /* Body text */
--font-mono: 'JetBrains Mono', monospace;        /* Code */
```

### Type Scale
```css
h1: 2rem (32px) - Bold - Page titles
h2: 1.5rem (24px) - Bold - Section headers
h3: 1.25rem (20px) - Semibold - Card titles
h4: 1.125rem (18px) - Semibold - Subsections
body: 1rem (16px) - Regular - Body text
small: 0.875rem (14px) - Regular - Captions
tiny: 0.75rem (12px) - Regular - Labels
```

### Font Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

---

## Spacing System

### Scale
```css
0: 0
1: 0.25rem (4px)
2: 0.5rem (8px)
3: 0.75rem (12px)
4: 1rem (16px)
5: 1.25rem (20px)
6: 1.5rem (24px)
8: 2rem (32px)
10: 2.5rem (40px)
12: 3rem (48px)
16: 4rem (64px)
```

### Usage
- Component padding: 4-6 (16-24px)
- Card spacing: 6 (24px)
- Section gaps: 8-10 (32-40px)
- Page margins: 4-8 (16-32px)

---

## Components

### Buttons

#### Primary
```jsx
className="bg-int-orange hover:bg-int-orange/90 text-white"
```

#### Secondary
```jsx
className="bg-int-navy hover:bg-int-navy/90 text-white"
```

#### Outline
```jsx
className="border-2 border-int-orange text-int-orange hover:bg-int-orange/10"
```

#### Ghost
```jsx
className="text-slate-600 hover:bg-slate-100"
```

### Cards

#### Glass Panel
```jsx
className="glass-panel-solid"  // White background with blur
className="glass-panel"         // Transparent with blur
```

#### Standard Card
```jsx
<Card className="border border-slate-200 bg-white">
```

#### Activity Card
```jsx
className="activity-card"  // Pre-styled with hover effects
```

### Badges

#### Status
```jsx
<Badge className="bg-emerald-500">Active</Badge>
<Badge className="bg-amber-500">Pending</Badge>
<Badge className="bg-red-500">Inactive</Badge>
```

#### Activity Type
```jsx
<Badge className="activity-badge-icebreaker">Icebreaker</Badge>
```

---

## Glassmorphism System

### Panel Variants
```css
.glass-panel {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.glass-panel-solid {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  transition: all 0.3s ease;
}
```

---

## Animations

### Motion Presets
```jsx
// Fade in
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}

// Slide up
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}

// Scale in
initial={{ opacity: 0, scale: 0.9 }}
animate={{ opacity: 1, scale: 1 }}

// Stagger children
variants={{
  container: { staggerChildren: 0.1 }
}}
```

### CSS Animations
```css
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
.animate-slide-up { animation: slideUp 0.4s ease-out; }
.animate-shimmer { animation: shimmer 1.5s infinite; }
.animate-pulse-glow { animation: pulse-glow 2s infinite; }
```

---

## Gradients

### Brand Gradients
```css
--gradient-orange: linear-gradient(135deg, #D97230 0%, #C46322 100%);
--gradient-navy: linear-gradient(135deg, #14294D 0%, #1e3a6d 100%);
--gradient-hero: linear-gradient(135deg, #14294D 0%, #D97230 100%);
```

### Activity Gradients
```css
--gradient-icebreaker: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
--gradient-creative: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
--gradient-wellness: linear-gradient(135deg, #10B981 0%, #059669 100%);
```

---

## Icons

### System
- Lucide React (primary icon library)
- Size variants: 16px, 20px, 24px, 32px
- Usage: `<Icon className="h-5 w-5" />`

### Emojis
- Used for visual enhancement
- Personality in empty states
- Activity type indicators

---

## Layout

### Grid System
```jsx
// 2 columns
className="grid grid-cols-1 md:grid-cols-2 gap-4"

// 3 columns
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"

// 4 columns
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
```

### Container
```jsx
className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
```

### Responsive Breakpoints
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

---

## Accessibility

### Focus States
```css
.focus-ring:focus-visible {
  outline: 2px solid var(--int-orange);
  outline-offset: 2px;
}
```

### Touch Targets
- Minimum: 44x44px
- Buttons: 40px height minimum
- Icons: 24x24px tap area

### Color Contrast
- Text on white: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: Clear hover states

---

## Loading States

### Spinners
```jsx
<LoadingSpinner size="default" type="orange" />
<LoadingSpinner size="small" type="navy" message="Loading..." />
```

### Skeletons
```jsx
<SkeletonGrid count={3} />
<LoadingState.Card count={4} />
<LoadingState.List count={5} />
```

---

## Empty States

### Variants
```jsx
<EmptyState
  icon={Calendar}
  title="No events yet"
  description="Get started by creating your first event"
  actionLabel="Create Event"
  onAction={() => navigate('/Calendar')}
  type="navy"
/>
```

---

## Forms

### Input Styles
```jsx
<Input className="border-slate-200 focus:border-int-orange" />
<Textarea className="border-slate-200 focus:border-int-orange" />
<Select className="border-slate-200 focus:border-int-orange" />
```

### Validation
```jsx
// Error state
<Input className="border-red-500" />
<p className="text-sm text-red-500">Error message</p>

// Success state
<Input className="border-emerald-500" />
```

---

## Best Practices

### Do's
✅ Use glass panels for main content areas
✅ Maintain consistent spacing (8px grid)
✅ Add loading states to all async operations
✅ Provide empty states with CTAs
✅ Use semantic color system
✅ Animate state transitions
✅ Support keyboard navigation
✅ Test on mobile devices

### Don'ts
❌ Don't use arbitrary colors outside palette
❌ Don't skip loading states
❌ Don't use text smaller than 12px
❌ Don't ignore mobile responsiveness
❌ Don't create components larger than 200 lines
❌ Don't bypass accessibility requirements
❌ Don't use inline styles (use Tailwind)

---

*Design System v1.0*
*Last Updated: 2025-12-12*