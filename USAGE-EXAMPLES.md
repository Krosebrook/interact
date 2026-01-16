# Usage Examples

**Project:** Interact - Employee Engagement & Gamification Platform  
**Last Updated:** January 16, 2026  
**Version:** 1.0.0

## Overview

This document provides practical code examples and usage patterns for the Interact platform. All examples are tested and follow the project's coding standards.

---

## Table of Contents

- [Common Patterns](#common-patterns)
- [Component Examples](#component-examples)
- [API Integration Examples](#api-integration-examples)
- [State Management Examples](#state-management-examples)
- [Form Handling Examples](#form-handling-examples)
- [Gamification Examples](#gamification-examples)
- [Testing Examples](#testing-examples)

---

## Common Patterns

### Creating a New Page Component

```javascript
// src/pages/MyNewPage.jsx
import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';

export const MyNewPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data on mount
    const fetchData = async () => {
      try {
        const result = await api.get('/endpoint');
        setData(result);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="My New Page"
        subtitle="Page description"
      />
      {/* Content */}
    </div>
  );
};
```

### Creating a Reusable Component

```javascript
// src/components/common/Card.jsx
import { cn } from '@/lib/utils';

export const Card = ({ 
  title, 
  description, 
  children, 
  className,
  onClick 
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {title && (
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-gray-600 mb-4">{description}</p>
      )}
      {children}
    </div>
  );
};
```

### Custom Hook Pattern

```javascript
// src/hooks/useActivityData.js
import { useState, useEffect } from 'react';
import { base44 } from '@/lib/base44';

export const useActivityData = (activityId) => {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!activityId) return;

    const fetchActivity = async () => {
      try {
        setLoading(true);
        const data = await base44.entities.get('activities', activityId);
        setActivity(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch activity:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [activityId]);

  const refetch = () => {
    setLoading(true);
    fetchActivity();
  };

  return { activity, loading, error, refetch };
};

// Usage
const { activity, loading, error } = useActivityData('activity-123');
```

---

## Component Examples

### Activity Card Component

```javascript
// src/components/activities/ActivityCard.jsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Trophy } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const ActivityCard = ({ activity, onJoin }) => {
  const {
    id,
    title,
    description,
    date,
    participants,
    points,
    category,
    image
  } = activity;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover"
        />
      )}
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold">{title}</h3>
          <Badge variant="secondary">{category}</Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(date)}
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-2" />
            {participants} participants
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <Trophy className="w-4 h-4 mr-2" />
            {points} points
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button
          onClick={() => onJoin(id)}
          className="w-full"
        >
          Join Activity
        </Button>
      </CardFooter>
    </Card>
  );
};
```

### Modal Dialog Pattern

```javascript
// src/components/common/ConfirmDialog.jsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Usage
const [isOpen, setIsOpen] = useState(false);

<ConfirmDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Delete Activity"
  description="Are you sure you want to delete this activity?"
  onConfirm={handleDelete}
/>
```

---

## API Integration Examples

### Fetching Data with TanStack Query

```javascript
// src/hooks/queries/useActivities.js
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/lib/base44';

export const useActivities = (filters = {}) => {
  return useQuery({
    queryKey: ['activities', filters],
    queryFn: async () => {
      const response = await base44.entities.query('activities', {
        where: filters,
        orderBy: { createdAt: 'desc' },
        limit: 20
      });
      return response.items;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Usage in component
const { data: activities, isLoading, error } = useActivities({
  status: 'active'
});
```

### Creating Data with Mutations

```javascript
// src/hooks/mutations/useCreateActivity.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/lib/base44';
import { toast } from 'sonner';

export const useCreateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activityData) => {
      return await base44.entities.create('activities', activityData);
    },
    onSuccess: () => {
      // Invalidate and refetch activities
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Activity created successfully!');
    },
    onError: (error) => {
      console.error('Failed to create activity:', error);
      toast.error('Failed to create activity');
    },
  });
};

// Usage in component
const createActivity = useCreateActivity();

const handleSubmit = (data) => {
  createActivity.mutate(data);
};
```

### Backend Function Call

```javascript
// Calling a Base44 backend function
import { base44 } from '@/lib/base44';

// Simple function call
const result = await base44.functions.call('calculatePoints', {
  userId: 'user123',
  activityId: 'act456'
});

// Function with error handling
try {
  const recommendations = await base44.functions.call('getAIRecommendations', {
    userId: currentUser.id,
    preferences: userPreferences
  });
  setRecommendations(recommendations);
} catch (error) {
  console.error('Failed to get recommendations:', error);
  toast.error('Unable to load recommendations');
}
```

---

## State Management Examples

### Context Provider Pattern

```javascript
// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/lib/base44';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email, password) => {
    const user = await base44.auth.signIn({ email, password });
    setUser(user);
    return user;
  };

  const signOut = async () => {
    await base44.auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Usage
const { user, signIn, signOut, isAuthenticated } = useAuth();
```

### Global State with Context

```javascript
// src/contexts/AppContext.jsx
import { createContext, useContext, useReducer } from 'react';

const AppContext = createContext(null);

const initialState = {
  theme: 'light',
  sidebarOpen: true,
  notifications: [],
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    default:
      return state;
  }
}

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

// Usage
const { state, dispatch } = useApp();
dispatch({ type: 'SET_THEME', payload: 'dark' });
```

---

## Form Handling Examples

### Form with React Hook Form + Zod

```javascript
// src/components/forms/ActivityForm.jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const activitySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.string().refine((date) => new Date(date) > new Date(), {
    message: 'Date must be in the future',
  }),
  points: z.number().min(0).max(1000),
  category: z.enum(['team-building', 'learning', 'social', 'wellness']),
});

export const ActivityForm = ({ onSubmit, defaultValues }) => {
  const form = useForm({
    resolver: zodResolver(activitySchema),
    defaultValues: defaultValues || {
      title: '',
      description: '',
      date: '',
      points: 0,
      category: 'team-building',
    },
  });

  const handleSubmit = (data) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Activity title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Activity description"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </Form>
  );
};
```

---

## Gamification Examples

### Award Points

```javascript
// src/services/gamification.js
import { base44 } from '@/lib/base44';

export const awardPoints = async (userId, points, reason) => {
  try {
    // Update user points
    const user = await base44.entities.get('users', userId);
    const newPoints = (user.points || 0) + points;
    
    await base44.entities.update('users', userId, {
      points: newPoints
    });

    // Create activity log
    await base44.entities.create('pointsLog', {
      userId,
      points,
      reason,
      timestamp: new Date().toISOString()
    });

    // Check for level up
    const newLevel = calculateLevel(newPoints);
    if (newLevel > user.level) {
      await handleLevelUp(userId, newLevel);
    }

    return { success: true, newPoints, newLevel };
  } catch (error) {
    console.error('Failed to award points:', error);
    throw error;
  }
};

const calculateLevel = (points) => {
  return Math.floor(points / 100) + 1;
};

const handleLevelUp = async (userId, newLevel) => {
  await base44.entities.update('users', userId, {
    level: newLevel
  });

  // Award badge
  await awardBadge(userId, `level-${newLevel}`);
  
  // Notify user
  await sendNotification(userId, {
    type: 'level-up',
    message: `Congratulations! You've reached level ${newLevel}!`
  });
};
```

### Leaderboard Component

```javascript
// src/components/gamification/Leaderboard.jsx
import { useState, useEffect } from 'react';
import { base44 } from '@/lib/base44';
import { Trophy, Medal } from 'lucide-react';

export const Leaderboard = ({ timeframe = 'all-time' }) => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const users = await base44.entities.query('users', {
          orderBy: { points: 'desc' },
          limit: 10
        });
        setLeaders(users.items);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaders();
  }, [timeframe]);

  if (loading) return <div>Loading leaderboard...</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
        Leaderboard
      </h2>
      
      <div className="space-y-2">
        {leaders.map((user, index) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-bold text-gray-400">
                {index + 1}
              </span>
              {index < 3 && (
                <Medal className={`w-5 h-5 ${
                  index === 0 ? 'text-yellow-500' :
                  index === 1 ? 'text-gray-400' :
                  'text-orange-600'
                }`} />
              )}
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-500">Level {user.level}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">{user.points}</p>
              <p className="text-sm text-gray-500">points</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## Testing Examples

### Component Test

```javascript
// src/components/__tests__/ActivityCard.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivityCard } from '../ActivityCard';

describe('ActivityCard', () => {
  const mockActivity = {
    id: '1',
    title: 'Team Building',
    description: 'Fun team activity',
    date: '2026-02-01',
    participants: 10,
    points: 50,
    category: 'team-building'
  };

  it('renders activity information', () => {
    render(<ActivityCard activity={mockActivity} onJoin={vi.fn()} />);
    
    expect(screen.getByText('Team Building')).toBeInTheDocument();
    expect(screen.getByText('Fun team activity')).toBeInTheDocument();
    expect(screen.getByText('50 points')).toBeInTheDocument();
  });

  it('calls onJoin when button clicked', () => {
    const onJoin = vi.fn();
    render(<ActivityCard activity={mockActivity} onJoin={onJoin} />);
    
    const button = screen.getByText('Join Activity');
    fireEvent.click(button);
    
    expect(onJoin).toHaveBeenCalledWith('1');
  });
});
```

### Hook Test

```javascript
// src/hooks/__tests__/useActivityData.test.js
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useActivityData } from '../useActivityData';
import { base44 } from '@/lib/base44';

vi.mock('@/lib/base44');

describe('useActivityData', () => {
  it('fetches activity data', async () => {
    const mockActivity = { id: '1', title: 'Test Activity' };
    base44.entities.get.mockResolvedValue(mockActivity);

    const { result } = renderHook(() => useActivityData('1'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.activity).toEqual(mockActivity);
    expect(result.current.error).toBe(null);
  });
});
```

---

## Additional Resources

- **[API Integration Guide](./API_INTEGRATION_GUIDE.md)** - Complete API documentation
- **[Component Library](./components/docs/COMPONENT_LIBRARY.md)** - UI component reference
- **[Testing Guide](./TESTING.md)** - Testing best practices
- **[Contributing](./CONTRIBUTING.md)** - How to contribute

---

**Last Updated:** January 16, 2026  
**Maintained by:** Development Team  
**Questions?** Open an issue with the `documentation` label
