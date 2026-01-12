import { describe, it, expect } from 'vitest';
import { formatFileSize } from '@/lib/imageUtils';

describe('formatFileSize', () => {
  it('should format 0 bytes correctly', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  it('should format bytes correctly', () => {
    expect(formatFileSize(500)).toBe('500 Bytes');
    expect(formatFileSize(1023)).toBe('1023 Bytes');
  });

  it('should format kilobytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(2048)).toBe('2 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('should format megabytes correctly', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(2097152)).toBe('2 MB');
    expect(formatFileSize(5242880)).toBe('5 MB');
  });

  it('should format gigabytes correctly', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB');
    expect(formatFileSize(2147483648)).toBe('2 GB');
  });

  it('should handle decimal values', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(2621440)).toBe('2.5 MB');
  });

  it('should round to 2 decimal places', () => {
    expect(formatFileSize(1234567)).toBe('1.18 MB');
  });

  it('should handle null or undefined', () => {
    expect(formatFileSize(null)).toBe('0 Bytes');
    expect(formatFileSize(undefined)).toBe('0 Bytes');
  });

  it('should handle very large files', () => {
    const result = formatFileSize(10737418240); // 10 GB
    expect(result).toBe('10 GB');
  });
});

// Note: compressImage and getImageDimensions require browser APIs (FileReader, Image, Canvas)
// which are complex to mock in unit tests. These should be tested with integration or E2E tests.
describe('Image processing functions', () => {
  it('should export compressImage function', async () => {
    const { compressImage } = await import('@/lib/imageUtils');
    expect(typeof compressImage).toBe('function');
  });

  it('should export getImageDimensions function', async () => {
    const { getImageDimensions } = await import('@/lib/imageUtils');
    expect(typeof getImageDimensions).toBe('function');
  });
});
