/**
 * Testing Utilities
 * Helper functions for unit and integration tests
 */

/**
 * Mock user data for testing
 */
export const mockUsers = {
  admin: {
    id: 'admin-1',
    email: 'admin@intinc.com',
    full_name: 'Admin User',
    role: 'admin',
    user_type: null
  },
  facilitator: {
    id: 'facilitator-1',
    email: 'facilitator@intinc.com',
    full_name: 'Facilitator User',
    role: 'user',
    user_type: 'facilitator'
  },
  participant: {
    id: 'participant-1',
    email: 'participant@intinc.com',
    full_name: 'Participant User',
    role: 'user',
    user_type: 'participant'
  }
};

/**
 * Mock event data
 */
export const mockEvent = {
  id: 'event-1',
  title: 'Test Event',
  activity_id: 'activity-1',
  scheduled_date: new Date().toISOString(),
  duration_minutes: 30,
  status: 'scheduled',
  event_format: 'online',
  created_by: 'admin@intinc.com'
};

/**
 * Mock activity data
 */
export const mockActivity = {
  id: 'activity-1',
  title: 'Test Activity',
  description: 'Test description',
  type: 'icebreaker',
  duration: '15-30min',
  instructions: 'Test instructions'
};

/**
 * Create mock query client for React Query tests
 */
export function createMockQueryClient() {
  return {
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn()
  };
}

/**
 * Wait for async operations
 * @param {number} ms - Milliseconds to wait
 */
export const waitFor = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Simulate API response
 * @param {any} data - Data to return
 * @param {number} delay - Response delay
 */
export async function mockApiResponse(data, delay = 100) {
  await waitFor(delay);
  return { data };
}

/**
 * Simulate API error
 * @param {string} message - Error message
 * @param {number} delay - Response delay
 */
export async function mockApiError(message = 'API Error', delay = 100) {
  await waitFor(delay);
  throw new Error(message);
}

/**
 * Assert element exists in DOM (for integration tests)
 * @param {string} selector - CSS selector or test ID
 */
export function assertElementExists(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }
  return element;
}

/**
 * Mock localStorage
 */
export const mockLocalStorage = (() => {
  let store = {};
  
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();