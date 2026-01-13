import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

/**
 * Sample utility tests demonstrating test infrastructure
 * These tests validate core utility functions used throughout the app
 */
describe('Sample Utils Tests', () => {
  it('should pass a basic assertion', () => {
    expect(true).toBe(true);
  });

  it('should format a string correctly', () => {
    const result = 'hello'.toUpperCase();
    expect(result).toBe('HELLO');
  });

  it('should handle string concatenation', () => {
    const firstName = 'John';
    const lastName = 'Doe';
    const fullName = `${firstName} ${lastName}`;
    expect(fullName).toBe('John Doe');
  });
});

/**
 * Tests for the cn() utility function
 * This is a critical utility used for merging Tailwind CSS classes
 */
describe('cn utility function', () => {
  it('should merge multiple class names', () => {
    const result = cn('bg-blue-500', 'text-white', 'p-4');
    expect(result).toContain('bg-blue-500');
    expect(result).toContain('text-white');
    expect(result).toContain('p-4');
  });

  it('should handle conditional classes correctly', () => {
    const isActive = true;
    const isDisabled = false;
    const result = cn(
      'base-class',
      isActive && 'active',
      isDisabled && 'disabled'
    );
    expect(result).toContain('base-class');
    expect(result).toContain('active');
    expect(result).not.toContain('disabled');
  });

  it('should handle empty or falsy values', () => {
    const result = cn('valid-class', null, undefined, false, '');
    expect(result).toBe('valid-class');
  });
});

/**
 * Tests for basic JavaScript operations
 * Validates that Vitest is properly configured
 */
describe('Basic JavaScript operations', () => {
  it('should perform array operations correctly', () => {
    const numbers = [1, 2, 3, 4, 5];
    const doubled = numbers.map(n => n * 2);
    expect(doubled).toEqual([2, 4, 6, 8, 10]);
  });

  it('should filter arrays correctly', () => {
    const numbers = [1, 2, 3, 4, 5, 6];
    const evenNumbers = numbers.filter(n => n % 2 === 0);
    expect(evenNumbers).toEqual([2, 4, 6]);
  });

  it('should handle object operations', () => {
    const user = { name: 'Alice', age: 30 };
    const updatedUser = { ...user, age: 31 };
    expect(updatedUser.name).toBe('Alice');
    expect(updatedUser.age).toBe(31);
    expect(user.age).toBe(30); // Original unchanged
  });
});
