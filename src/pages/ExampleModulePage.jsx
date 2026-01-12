import { ExampleFeatureWidget, ExampleFeatureCard } from '@/modules/example-feature';
import { Card } from '@/components/ui/card';

/**
 * Example Page demonstrating the new modular architecture
 * 
 * This page shows how to use the new feature modules in your application.
 * Replace 'example-feature' with your actual feature name.
 */
export default function ExampleModulePage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Example Feature Module</h1>
        <p className="text-slate-600">
          Demonstration of the new modular architecture with Base44 integration
        </p>
      </div>

      {/* Example Feature Widget */}
      <ExampleFeatureWidget 
        title="My Custom Feature" 
        showMetrics={true}
      />

      {/* Example Feature Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ExampleFeatureCard
          title="Card Example 1"
          description="This demonstrates the card component pattern"
          status="active"
        >
          <p className="text-sm text-slate-600">
            Custom content can be passed as children to the card component.
          </p>
        </ExampleFeatureCard>

        <ExampleFeatureCard
          title="Card Example 2"
          description="Another instance with different content"
          status="pending"
        >
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              The modular architecture makes it easy to reuse components.
            </p>
            <p className="text-xs text-slate-500">
              All components are Base44-compatible with sync attributes.
            </p>
          </div>
        </ExampleFeatureCard>
      </div>

      {/* Documentation Reference */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold mb-2">📚 Documentation</h3>
        <p className="text-sm text-slate-700 mb-3">
          For detailed information about implementing features with this architecture:
        </p>
        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
          <li>See <code className="bg-white px-1 py-0.5 rounded">.github/base44-updates.md</code> for Base44 integration guide</li>
          <li>See <code className="bg-white px-1 py-0.5 rounded">.github/agents.md</code> for AI agent context</li>
          <li>See <code className="bg-white px-1 py-0.5 rounded">src/modules/example-feature/</code> for reference implementation</li>
        </ul>
      </Card>
    </div>
  );
}
