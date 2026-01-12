/**
 * Example Feature Module
 * 
 * This module demonstrates the standard architecture for implementing
 * new features in the Interact platform with Base44 compatibility.
 * 
 * @module example-feature
 * @version 1.0.0
 * @base44-compatible true
 */

export { default as ExampleFeatureWidget } from './components/ExampleFeatureWidget';
export { default as ExampleFeatureCard } from './components/ExampleFeatureCard';
export { useExampleFeatureData } from './hooks/useExampleFeatureData';
export { exampleFeatureService } from './services/exampleFeatureService';
export * from './utils/exampleFeatureHelpers';
