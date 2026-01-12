import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn (className merger)', () => {
  it('should merge class names correctly', () => {
    const result = cn('bg-red-500', 'text-white');
    expect(result).toBe('bg-red-500 text-white');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toBe('base-class active-class');
  });

  it('should handle falsy values', () => {
    const result = cn('base-class', false, null, undefined, 'other-class');
    expect(result).toBe('base-class other-class');
  });

  it('should merge Tailwind conflicting classes correctly', () => {
    // twMerge should prioritize the last class when there's a conflict
    const result = cn('px-2', 'px-4');
    expect(result).toBe('px-4');
  });

  it('should handle arrays of classes', () => {
    const result = cn(['bg-red-500', 'text-white'], 'p-4');
    expect(result).toBe('bg-red-500 text-white p-4');
  });

  it('should handle objects with boolean values', () => {
    const result = cn({
      'bg-red-500': true,
      'text-white': true,
      'hidden': false,
    });
    expect(result).toBe('bg-red-500 text-white');
  });

  it('should handle empty inputs', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle complex nested structures', () => {
    const result = cn(
      'base',
      ['array-class-1', 'array-class-2'],
      { 'object-class': true, 'hidden': false },
      true && 'conditional-class',
      false && 'not-included'
    );
    expect(result).toContain('base');
    expect(result).toContain('array-class-1');
    expect(result).toContain('object-class');
    expect(result).toContain('conditional-class');
    expect(result).not.toContain('not-included');
  });
});

describe('isIframe check', () => {
  it('should export isIframe', async () => {
    // This is environment-dependent, just check it exists
    const { isIframe } = await import('@/lib/utils');
    expect(typeof isIframe).toBe('boolean');
  });
});
