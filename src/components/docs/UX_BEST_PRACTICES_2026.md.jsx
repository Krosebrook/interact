# INTeract UX & Design Best Practices
**Version:** 2.0  
**Last Updated:** January 26, 2026  
**Design System:** Glassmorphism + Modern SaaS

---

## 🎨 Design Principles

### 1. Mobile-First
Every feature must work beautifully on mobile before desktop.

```css
/* Mobile-first responsive design */
.container {
  /* Base: Mobile (320px+) */
  padding: 1rem;
  
  /* Tablet (640px+) */
  @media (min-width: 640px) {
    padding: 1.5rem;
  }
  
  /* Desktop (1024px+) */
  @media (min-width: 1024px) {
    padding: 2rem;
    max-width: 1280px;
  }
}

/* Touch targets: Minimum 44x44px */
.button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
}
```

### 2. Accessibility First (WCAG 2.1 AA)
Accessible design benefits everyone.

```javascript
// ✅ Good: Semantic HTML
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
    <li><a href="/events">Events</a></li>
  </ul>
</nav>

// ✅ Good: ARIA labels
<button aria-label="Close dialog" onClick={onClose}>
  <X className="h-5 w-5" />
</button>

// ✅ Good: Focus management
useEffect(() => {
  if (isOpen) {
    dialogRef.current?.focus();
  }
}, [isOpen]);

// ✅ Good: Keyboard navigation
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Action Item
</div>

// ✅ Good: Color contrast
/* WCAG AA: 4.5:1 for normal text, 3:1 for large text */
--text-primary: #14294D;      /* 12:1 on white ✅ */
--text-secondary: #334155;    /* 4.5:1 on white ✅ */
--int-orange-wcag: #B85C1A;   /* 5.5:1 on white ✅ */
```

### 3. Consistent Visual Language
Users should never feel lost or confused.

```javascript
// Color System
--int-navy: #14294D;        // Headers, primary text
--int-orange: #D97230;      // CTAs, highlights
--int-gold: #F5C16A;        // Accents, success
--int-teal: #2DD4BF;        // Links, info

// Activity Types (always use same colors)
--activity-icebreaker: #3B82F6;   // Blue
--activity-creative: #8B5CF6;     // Purple
--activity-competitive: #F59E0B;  // Amber
--activity-wellness: #10B981;     // Green
--activity-learning: #06B6D4;     // Cyan
--activity-social: #EC4899;       // Pink

// Status Colors
--status-success: #10B981;   // Green
--status-warning: #F59E0B;   // Amber
--status-error: #EF4444;     // Red
--status-info: #3B82F6;      // Blue
```

### 4. Progressive Disclosure
Show only what's needed, when it's needed.

```javascript
// ✅ Good: Collapsed by default
<Accordion>
  <AccordionItem value="details">
    <AccordionTrigger>Event Details</AccordionTrigger>
    <AccordionContent>
      {/* Detailed content only shown on expand */}
    </AccordionContent>
  </AccordionItem>
</Accordion>

// ✅ Good: Step-by-step forms
<FormWizard steps={['Basic Info', 'Details', 'Review']}>
  <Step1 />
  <Step2 />
  <Step3 />
</FormWizard>

// ✅ Good: Tooltips for advanced features
<Button>
  Create Event
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <HelpCircle className="h-4 w-4 ml-1" />
      </TooltipTrigger>
      <TooltipContent>
        Events can be recurring, have series, and include custom activities.
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</Button>
```

### 5. Immediate Feedback
Every action gets a response.

```javascript
// Loading states
<Button onClick={handleClick} disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin mr-2" />
      Processing...
    </>
  ) : (
    'Submit'
  )}
</Button>

// Success feedback
const handleSubmit = async () => {
  try {
    await createRecognition(data);
    
    // Visual feedback
    toast.success('Recognition sent!', {
      description: `${recipient.name} has been notified.`
    });
    
    // Haptic feedback (mobile)
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // Confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  } catch (error) {
    toast.error('Failed to send recognition', {
      description: 'Please try again or contact support.'
    });
  }
};

// Error recovery
<ErrorBoundary
  fallback={
    <ErrorFallback
      onReset={() => window.location.reload()}
    />
  }
>
  <DashboardContent />
</ErrorBoundary>
```

---

## 🎯 UX Patterns

### Loading States
```javascript
// Skeleton screens (preferred over spinners)
function EventCardSkeleton() {
  return (
    <Card className="p-6">
      <Skeleton className="h-6 w-48 mb-2" />
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-20 w-full mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
    </Card>
  );
}

// Progressive loading
1. Show skeleton immediately
2. Load critical data first
3. Render partial UI
4. Load secondary data in background
5. Complete UI when ready

// Loading states hierarchy
if (isLoading) return <Skeleton />;        // Initial load
if (isRefetching) return <RefreshBadge />; // Background update
if (isError) return <ErrorState />;        // Error
return <Content data={data} />;            // Success
```

### Empty States
```javascript
// Engaging empty states with actions
<EmptyState
  icon={Calendar}
  title="No events scheduled"
  description="Ready to plan your first team activity?"
  illustration="https://illustrations.popsy.co/white/calendar.svg"
  actions={[
    {
      label: "Create Event",
      onClick: () => setShowCreateDialog(true),
      variant: "default",
      icon: Plus
    },
    {
      label: "Browse Templates",
      onClick: () => navigate('/templates'),
      variant: "outline"
    }
  ]}
  stats={[
    { label: "Total Events", value: "0" },
    { label: "Participants", value: "Ready to join!" }
  ]}
/>
```

### Confirmation Dialogs
```javascript
// Destructive actions require confirmation
function DeleteButton({ itemName, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);
  
  return (
    <>
      <Button variant="destructive" onClick={() => setShowConfirm(true)}>
        Delete
      </Button>
      
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{itemName}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

### Toast Notifications
```javascript
import { toast } from 'sonner';

// Success
toast.success('Event created!', {
  description: 'Participants have been notified.',
  duration: 4000
});

// Error with action
toast.error('Failed to save changes', {
  description: 'Please try again or contact support.',
  action: {
    label: 'Retry',
    onClick: () => handleRetry()
  },
  duration: 6000
});

// Info
toast.info('New feature available!', {
  description: 'Check out the new AI event planner.',
  action: {
    label: 'Learn More',
    onClick: () => navigate('/features/ai-planner')
  }
});

// Loading toast that updates
const toastId = toast.loading('Uploading image...');

// Later...
toast.success('Image uploaded!', { id: toastId });
// or
toast.error('Upload failed', { id: toastId });
```

---

## 📱 Mobile-Specific UX

### Touch Gestures
```javascript
// Swipe to delete
<div
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
  className="relative overflow-hidden"
>
  <div
    className="transition-transform"
    style={{ transform: `translateX(${swipeOffset}px)` }}
  >
    <ItemContent />
  </div>
  
  {swipeOffset < -100 && (
    <div className="absolute right-0 top-0 h-full bg-red-500 px-6 flex items-center">
      <Trash2 className="h-5 w-5 text-white" />
    </div>
  )}
</div>

// Pull to refresh
<div
  onTouchStart={handlePullStart}
  onTouchMove={handlePullMove}
  onTouchEnd={handlePullEnd}
>
  {pullDistance > 80 && (
    <div className="flex justify-center py-4">
      <RefreshCw className="h-6 w-6 animate-spin" />
    </div>
  )}
  <ContentList />
</div>
```

### Bottom Navigation (Mobile)
```javascript
// Mobile: Bottom nav for thumb reach
function MobileLayout() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  if (isMobile) {
    return (
      <div className="pb-16">
        <main>{children}</main>
        
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
          <div className="flex justify-around py-2">
            <NavButton icon={Home} label="Home" />
            <NavButton icon={Calendar} label="Events" />
            <NavButton icon={Award} label="Points" />
            <NavButton icon={User} label="Profile" />
          </div>
        </nav>
      </div>
    );
  }
  
  // Desktop: Sidebar navigation
  return <DesktopLayout>{children}</DesktopLayout>;
}
```

### Haptic Feedback
```javascript
// Subtle vibrations on interactions
const haptic = {
  light: () => navigator.vibrate?.(10),
  medium: () => navigator.vibrate?.(50),
  heavy: () => navigator.vibrate?.(100),
  
  success: () => navigator.vibrate?.([50, 50, 50]),
  error: () => navigator.vibrate?.([100, 50, 100]),
  
  tap: () => navigator.vibrate?.(5)
};

<Button onClick={() => {
  haptic.tap();
  handleClick();
}}>
  Submit
</Button>

<Button onClick={async () => {
  try {
    await saveChanges();
    haptic.success();
    toast.success('Saved!');
  } catch (error) {
    haptic.error();
    toast.error('Failed to save');
  }
}}>
  Save
</Button>
```

---

## ✨ Micro-interactions

### Hover Effects
```css
/* Lift on hover */
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/* Scale on hover */
.hover-scale:hover {
  transform: scale(1.02);
}

/* Glow on hover */
.hover-glow:hover {
  box-shadow: 0 0 20px rgba(217, 114, 48, 0.4);
}
```

### Click Feedback
```css
/* Press effect */
.press-effect:active {
  transform: scale(0.98);
}

/* Ripple effect */
@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

.ripple-button {
  position: relative;
  overflow: hidden;
}

.ripple-button::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: scale(0);
  animation: ripple 0.6s ease-out;
}
```

### Animations
```javascript
// Framer Motion entrance animations
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  <Card />
</motion.div>

// Stagger children
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
  initial="hidden"
  animate="show"
>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 }
      }}
    >
      <ItemCard item={item} />
    </motion.div>
  ))}
</motion.div>

// Number counting animation
<AnimatedCounter
  from={0}
  to={userPoints.total_points}
  duration={1000}
  suffix=" pts"
/>
```

---

## 🎭 Component Patterns

### Card Component
```javascript
// Standard card pattern
<Card className="glass-card hover-lift">
  <CardHeader>
    <CardTitle>Event Title</CardTitle>
    <CardDescription>Brief description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Activity card with image overlay
<div className="activity-card">
  <div className="activity-card-header">
    <img src={activity.image_url} alt={activity.title} />
    <div className="activity-card-badge activity-badge-creative">
      {activity.type}
    </div>
    <h3 className="activity-card-title">{activity.title}</h3>
  </div>
  <CardContent>
    <p>{activity.description}</p>
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <Clock className="h-4 w-4" />
      <span>{activity.duration}</span>
    </div>
  </CardContent>
</div>
```

### Dialog/Modal Pattern
```javascript
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Create Event</Button>
  </DialogTrigger>
  
  <DialogContent className="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle>Create New Event</DialogTitle>
      <DialogDescription>
        Schedule a new team activity or meeting.
      </DialogDescription>
    </DialogHeader>
    
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields */}
    </form>
    
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button type="submit" onClick={handleSubmit}>
        Create Event
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Tabs Pattern
```javascript
<Tabs defaultValue="upcoming" className="w-full">
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="upcoming">
      Upcoming ({upcomingEvents.length})
    </TabsTrigger>
    <TabsTrigger value="past">
      Past ({pastEvents.length})
    </TabsTrigger>
    <TabsTrigger value="bookmarked">
      Saved ({bookmarked.length})
    </TabsTrigger>
  </TabsList>
  
  <TabsContent value="upcoming">
    <EventGrid events={upcomingEvents} />
  </TabsContent>
  
  <TabsContent value="past">
    <EventGrid events={pastEvents} />
  </TabsContent>
  
  <TabsContent value="bookmarked">
    <EventGrid events={bookmarked} />
  </TabsContent>
</Tabs>
```

---

## 🎨 Glassmorphism Design System

### Glass Components
```css
/* Base glass panel */
.glass-panel {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(14px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
}

/* Light glass (more visible) */
.glass-panel-light {
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(14px);
}

/* Solid glass (high readability) */
.glass-panel-solid {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(14px);
}

/* Glass card (interactive) */
.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}
```

### Background System
```css
/* Immersive background */
.immersive-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('sunset-mountains.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  z-index: -1;
}

.immersive-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.05) 50%,
    rgba(0, 0, 0, 0.2) 100%
  );
}
```

### Text Contrast on Backgrounds
```css
/* White text with shadow for dark backgrounds */
.text-on-dark {
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Dark text for light glass panels */
.text-on-light {
  color: #14294D;
  text-shadow: none;
}

/* Hero text with multiple shadows */
.hero-text {
  color: white;
  text-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.2),
    0 2px 4px rgba(0, 0, 0, 0.3),
    0 4px 8px rgba(0, 0, 0, 0.1);
  font-weight: 700;
  letter-spacing: -0.02em;
}
```

---

## 📊 Data Visualization Best Practices

### Chart Guidelines
```javascript
// Use Recharts for consistent styling
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={engagementData}>
    <XAxis
      dataKey="date"
      stroke="#64748b"
      fontSize={12}
    />
    <YAxis
      stroke="#64748b"
      fontSize={12}
    />
    <Tooltip
      contentStyle={{
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        backdropFilter: 'blur(12px)'
      }}
    />
    <Line
      type="monotone"
      dataKey="engagement"
      stroke="#D97230"
      strokeWidth={3}
      dot={{ fill: '#D97230', r: 4 }}
      activeDot={{ r: 6 }}
    />
  </LineChart>
</ResponsiveContainer>

// Color-blind friendly palette
const chartColors = {
  primary: '#3B82F6',    // Blue
  secondary: '#F59E0B',  // Amber
  tertiary: '#10B981',   // Green
  quaternary: '#8B5CF6', // Purple
  quinary: '#EC4899'     // Pink
};
```

### Stats Display
```javascript
// KPI cards
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  <StatCard
    label="Total Points"
    value={formatNumber(totalPoints)}
    change="+12.5%"
    trend="up"
    icon={Award}
    color="orange"
  />
  <StatCard
    label="Events Attended"
    value={eventsAttended}
    change="+3"
    trend="up"
    icon={Calendar}
    color="blue"
  />
  <StatCard
    label="Recognition Given"
    value={recognitionsSent}
    change="+8"
    trend="up"
    icon={Heart}
    color="pink"
  />
  <StatCard
    label="Current Streak"
    value={`${currentStreak} days`}
    change={streakChange}
    trend={streakChange > 0 ? 'up' : 'stable'}
    icon={Flame}
    color="red"
  />
</div>
```

---

## 🎬 Animation Guidelines

### Performance Budgets
```javascript
// Max animation duration: 300ms
// Max simultaneous animations: 5
// Prefer transform and opacity (GPU-accelerated)

// ✅ Good: GPU-accelerated
.animate-slide {
  transform: translateX(-20px);
  opacity: 0;
  transition: transform 0.3s, opacity 0.3s;
}

.animate-slide.active {
  transform: translateX(0);
  opacity: 1;
}

// ❌ Bad: Causes reflow
.animate-slide-bad {
  left: -20px;
  transition: left 0.3s;
}
```

### Reduced Motion Support
```javascript
// Respect user preferences
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

// JavaScript detection
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

{!prefersReducedMotion ? (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <Content />
  </motion.div>
) : (
  <div>
    <Content />
  </div>
)}
```

---

## 🔤 Typography System

### Font Hierarchy
```css
/* Display */
.text-display {
  font-size: 3rem;        /* 48px */
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: -0.02em;
}

/* Heading 1 */
.text-h1 {
  font-size: 2.25rem;     /* 36px */
  line-height: 1.2;
  font-weight: 700;
}

/* Heading 2 */
.text-h2 {
  font-size: 1.875rem;    /* 30px */
  line-height: 1.3;
  font-weight: 600;
}

/* Body */
.text-body {
  font-size: 1rem;        /* 16px */
  line-height: 1.5;
  font-weight: 400;
}

/* Small */
.text-small {
  font-size: 0.875rem;    /* 14px */
  line-height: 1.4;
}

/* Caption */
.text-caption {
  font-size: 0.75rem;     /* 12px */
  line-height: 1.3;
  color: var(--text-secondary-wcag);
}
```

---

## 🎯 Form UX Best Practices

### Inline Validation
```javascript
<Input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  onBlur={() => validateEmail(email)}
  error={emailError}
  success={!emailError && email.length > 0}
/>

{emailError && (
  <p className="text-sm text-red-600 mt-1">
    {emailError}
  </p>
)}

{!emailError && email.length > 0 && (
  <p className="text-sm text-green-600 mt-1">
    ✓ Valid email
  </p>
)}
```

### Smart Defaults
```javascript
// Pre-fill with user data
<form>
  <Input
    label="Your Email"
    defaultValue={user.email}
    disabled  // Can't change email
  />
  
  <Input
    label="Recipient"
    placeholder="Search for a colleague..."
    autoComplete="off"
  />
  
  <Textarea
    label="Message"
    placeholder="Write your recognition message..."
    defaultValue=""  // Empty for new input
  />
  
  <Select
    label="Recognition Type"
    defaultValue="peer_shoutout"  // Most common
  >
    <SelectItem value="peer_shoutout">Peer Shoutout</SelectItem>
    <SelectItem value="thank_you">Thank You</SelectItem>
    <SelectItem value="great_work">Great Work</SelectItem>
  </Select>
</form>
```

### Auto-save Drafts
```javascript
function EventForm() {
  const [formData, setFormData] = useState(loadDraft() || {});
  
  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (formData.title || formData.description) {
        saveDraft(formData);
        toast.info('Draft saved', { duration: 1000 });
      }
    }, 30 * 1000);
    
    return () => clearInterval(interval);
  }, [formData]);
  
  // Save on unmount
  useEffect(() => {
    return () => saveDraft(formData);
  }, [formData]);
  
  return (
    <form>
      {/* Form fields */}
    </form>
  );
}
```

---

**Last Updated:** January 26, 2026  
**Design System Version:** 2.0  
**Next Review:** April 2026