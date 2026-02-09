import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import IntegrationCard from '../components/integrations/IntegrationCard';
import INTEGRATIONS_REGISTRY from '@/lib/integrationsRegistry';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Search } from 'lucide-react';

const CATEGORIES = {
  communication: { label: 'Communication', icon: '💬' },
  productivity: { label: 'Productivity', icon: '📊' },
  analytics: { label: 'Analytics', icon: '📈' },
  automation: { label: 'Automation', icon: '⚡' },
  authentication: { label: 'Authentication', icon: '🔐' },
  crm: { label: 'CRM & Business', icon: '🎫' },
  payments: { label: 'Payments', icon: '💳' },
  monitoring: { label: 'Monitoring', icon: '🔔' }
};

export default function IntegrationsHub() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { data: enabledIntegrations, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const results = await base44.entities.Integration.list();
      return results;
    }
  });

  const integrationsWithStatus = useMemo(() => {
    return Object.values(INTEGRATIONS_REGISTRY).map(integration => {
      const enabled = enabledIntegrations?.find(e => e.integration_id === integration.id);
      return {
        ...integration,
        is_enabled: enabled?.is_enabled || false,
        is_authorized: enabled?.is_authorized || false,
        status: enabled?.status || 'pending',
        error_message: enabled?.error_message,
        last_tested: enabled?.last_tested
      };
    });
  }, [enabledIntegrations]);

  const filteredIntegrations = useMemo(() => {
    return integrationsWithStatus.filter(i => {
      const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           i.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || i.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [integrationsWithStatus, searchTerm, selectedCategory]);

  const groupedByCategory = useMemo(() => {
    const groups = {};
    filteredIntegrations.forEach(i => {
      if (!groups[i.category]) groups[i.category] = [];
      groups[i.category].push(i);
    });
    return groups;
  }, [filteredIntegrations]);

  const enabledCount = integrationsWithStatus.filter(i => i.is_enabled).length;
  const activeCount = integrationsWithStatus.filter(i => i.status === 'active').length;

  if (isLoading) {
    return <LoadingSpinner message="Loading integrations..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Integrations</h1>
          <p className="text-slate-600">Connect your favorite tools to enhance INTeract</p>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="text-3xl font-bold text-int-orange">{enabledCount}</div>
              <div className="text-sm text-slate-600">Enabled Integrations</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="text-3xl font-bold text-green-600">{activeCount}</div>
              <div className="text-sm text-slate-600">Active & Working</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Tabs */}
        <Tabs defaultValue="all" onValueChange={(v) => setSelectedCategory(v === 'all' ? null : v)}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="all">All</TabsTrigger>
            {Object.entries(CATEGORIES).map(([key, { label }]) => (
              <TabsTrigger key={key} value={key}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            {Object.entries(groupedByCategory).map(([category, intégrations]) => (
              <div key={category}>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span>{CATEGORIES[category]?.icon}</span>
                  {CATEGORIES[category]?.label}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {intégrations.map(integration => (
                    <IntegrationCard
                      key={integration.id}
                      integration={integration}
                    />
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          {Object.entries(CATEGORIES).map(([categoryKey]) => (
            <TabsContent key={categoryKey} value={categoryKey} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedByCategory[categoryKey]?.map(integration => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}