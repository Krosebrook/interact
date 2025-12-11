/**
 * PERFORMANCE MONITORING & OPTIMIZATION
 * Tools for tracking and improving app performance
 */

// ============================================================================
// PERFORMANCE METRICS
// ============================================================================

export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.enabled = process.env.NODE_ENV === 'development';
  }

  /**
   * Start timing an operation
   */
  startTimer(label) {
    if (!this.enabled) return;
    
    const startTime = performance.now();
    this.metrics.set(label, { startTime, measurements: [] });
  }

  /**
   * End timing an operation
   */
  endTimer(label) {
    if (!this.enabled || !this.metrics.has(label)) return;
    
    const endTime = performance.now();
    const metric = this.metrics.get(label);
    const duration = endTime - metric.startTime;
    
    metric.measurements.push(duration);
    
    if (duration > 1000) {
      console.warn(`⚠️ Slow operation: ${label} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }

  /**
   * Get performance stats for an operation
   */
  getStats(label) {
    if (!this.metrics.has(label)) return null;
    
    const measurements = this.metrics.get(label).measurements;
    const sum = measurements.reduce((a, b) => a + b, 0);
    const avg = sum / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);
    
    return { count: measurements.length, avg, min, max, total: sum };
  }

  /**
   * Log all performance metrics
   */
  logAll() {
    if (!this.enabled) return;
    
    console.group('📊 Performance Metrics');
    for (const [label, data] of this.metrics.entries()) {
      if (data.measurements.length > 0) {
        const stats = this.getStats(label);
        console.log(`${label}:`, {
          count: stats.count,
          avg: `${stats.avg.toFixed(2)}ms`,
          min: `${stats.min.toFixed(2)}ms`,
          max: `${stats.max.toFixed(2)}ms`
        });
      }
    }
    console.groupEnd();
  }

  /**
   * Clear metrics
   */
  clear() {
    this.metrics.clear();
  }
}

// Global instance
export const perfMonitor = new PerformanceMonitor();

// ============================================================================
// REACT PERFORMANCE HELPERS
// ============================================================================

/**
 * Wrapper for expensive computations with performance tracking
 */
export function withPerfTracking(fn, label) {
  return function(...args) {
    perfMonitor.startTimer(label);
    const result = fn.apply(this, args);
    perfMonitor.endTimer(label);
    return result;
  };
}

/**
 * Measure component render time
 */
export function measureRender(componentName, renderFn) {
  return function() {
    perfMonitor.startTimer(`render:${componentName}`);
    const result = renderFn.apply(this, arguments);
    perfMonitor.endTimer(`render:${componentName}`);
    return result;
  };
}

// ============================================================================
// WEB VITALS MONITORING
// ============================================================================

export function initWebVitals() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }

  // Cumulative Layout Shift
  let clsValue = 0;
  let clsEntries = [];
  
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        clsEntries.push(entry);
      }
    }
  });
  
  try {
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    // Layout shift not supported
  }

  // Largest Contentful Paint
  let lcpValue = 0;
  
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    lcpValue = lastEntry.renderTime || lastEntry.loadTime;
  });
  
  try {
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    // LCP not supported
  }

  // First Input Delay
  let fidValue = 0;
  
  const fidObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      fidValue = entry.processingStart - entry.startTime;
    }
  });
  
  try {
    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch (e) {
    // FID not supported
  }

  // Log vitals after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.group('🎯 Web Vitals');
      console.log('CLS (Cumulative Layout Shift):', clsValue.toFixed(3), clsValue < 0.1 ? '✅' : '⚠️');
      console.log('LCP (Largest Contentful Paint):', `${lcpValue.toFixed(0)}ms`, lcpValue < 2500 ? '✅' : '⚠️');
      console.log('FID (First Input Delay):', `${fidValue.toFixed(0)}ms`, fidValue < 100 ? '✅' : '⚠️');
      console.groupEnd();
    }, 3000);
  });
}

// ============================================================================
// BUNDLE SIZE WARNINGS
// ============================================================================

export function checkBundleSize() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }

  const resources = performance.getEntriesByType('resource');
  const jsResources = resources.filter(r => r.name.endsWith('.js'));
  
  const totalSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
  const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
  
  console.group('📦 Bundle Analysis');
  console.log(`Total JS Size: ${totalSizeMB} MB`);
  
  const largeFiles = jsResources
    .filter(r => (r.transferSize || 0) > 100000)
    .sort((a, b) => (b.transferSize || 0) - (a.transferSize || 0));
  
  if (largeFiles.length > 0) {
    console.warn('Large JS files (>100KB):');
    largeFiles.forEach(r => {
      const sizeMB = ((r.transferSize || 0) / 1024).toFixed(1);
      console.log(`  ${r.name.split('/').pop()}: ${sizeMB} KB`);
    });
  }
  
  console.groupEnd();
}

// ============================================================================
// DEBOUNCE & THROTTLE (Performance Helpers)
// ============================================================================

export function debounce(func, wait = 300, immediate = false) {
  let timeout;
  
  return function executedFunction(...args) {
    const context = this;
    
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func.apply(context, args);
  };
}

export function throttle(func, limit = 300) {
  let inThrottle;
  
  return function(...args) {
    const context = this;
    
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ============================================================================
// MEMORY LEAK DETECTION
// ============================================================================

export class MemoryMonitor {
  constructor() {
    this.snapshots = [];
    this.enabled = process.env.NODE_ENV === 'development' && 
                   typeof performance !== 'undefined' && 
                   performance.memory;
  }

  takeSnapshot(label = 'snapshot') {
    if (!this.enabled) return;
    
    const memory = performance.memory;
    this.snapshots.push({
      label,
      timestamp: Date.now(),
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit
    });
  }

  analyze() {
    if (!this.enabled || this.snapshots.length < 2) return;
    
    const first = this.snapshots[0];
    const last = this.snapshots[this.snapshots.length - 1];
    const growth = last.usedJSHeapSize - first.usedJSHeapSize;
    const growthMB = (growth / 1024 / 1024).toFixed(2);
    
    console.group('🧠 Memory Analysis');
    console.log(`Memory Growth: ${growthMB} MB`);
    console.log(`Current Usage: ${(last.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Heap Limit: ${(last.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
    
    if (growth > 10000000) { // 10MB growth
      console.warn('⚠️ Significant memory growth detected. Check for memory leaks.');
    }
    
    console.groupEnd();
  }

  clear() {
    this.snapshots = [];
  }
}

export const memoryMonitor = new MemoryMonitor();

// ============================================================================
// INITIALIZATION
// ============================================================================

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Initialize web vitals monitoring
  initWebVitals();
  
  // Check bundle size after load
  window.addEventListener('load', () => {
    setTimeout(checkBundleSize, 2000);
  });
  
  // Expose performance tools globally for debugging
  window.__perf = {
    monitor: perfMonitor,
    memory: memoryMonitor,
    logAll: () => {
      perfMonitor.logAll();
      memoryMonitor.analyze();
    }
  };
  
  console.log('🔧 Performance monitoring enabled. Use window.__perf.logAll() to view metrics.');
}