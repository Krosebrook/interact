import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Settings, ExternalLink, Check, AlertCircle, Clock } from 'lucide-react';

const INTEGRATION_INFO = {
  openai: { 
    name: 'OpenAI', 
    icon: '🤖', 
    color: 'bg-green-500',
    description: 'GPT-4o, o1, vision, DALL-E 3, TTS, Whisper, embeddings',
    docs: 'https://platform.openai.com/docs'
  },
  claude: { 
    name: 'Claude (Anthropic)', 
    icon: '🧠', 
    color: 'bg-orange-500',
    description: 'Claude 4 Sonnet, vision, extended thinking, tools',
    docs: 'https://docs.anthropic.com'
  },
  gemini: { 
    name: 'Google Gemini', 
    icon: '✨', 
    color: 'bg-blue-600',
    description: 'Gemini 2.0, vision, video, thinking, code',
    docs: 'https://ai.google.dev/docs'
  },
  perplexity: { 
    name: 'Perplexity', 
    icon: '🔍', 
    color: 'bg-blue-500',
    description: 'Real-time web search AI',
    docs: 'https://docs.perplexity.ai'
  },
  notion: { 
    name: 'Notion', 
    icon: '📝', 
    color: 'bg-slate-800',
    description: 'Databases, pages, blocks',
    docs: 'https://developers.notion.com'
  },
  google_maps: { 
    name: 'Google Maps & Places', 
    icon: '🗺️', 
    color: 'bg-red-500',
    description: 'Places, geocoding, directions',
    docs: 'https://developers.google.com/maps'
  },
  hubspot: { 
    name: 'HubSpot', 
    icon: '📊', 
    color: 'bg-orange-600',
    description: 'CRM contacts, companies, deals',
    docs: 'https://developers.hubspot.com'
  },
  zapier: { 
    name: 'Zapier', 
    icon: '⚡', 
    color: 'bg-orange-400',
    description: 'Webhook automations',
    docs: 'https://zapier.com/developer'
  },
  elevenlabs: { 
    name: 'ElevenLabs', 
    icon: '🎙️', 
    color: 'bg-purple-600',
    description: 'AI voice synthesis',
    docs: 'https://elevenlabs.io/docs'
  },
  cloudinary: { 
    name: 'Cloudinary', 
    icon: '🖼️', 
    color: 'bg-blue-600',
    description: 'Image/video optimization',
    docs: 'https://cloudinary.com/documentation'
  },
  microsoft_teams: { 
    name: 'Microsoft Teams', 
    icon: '💬', 
    color: 'bg-indigo-600',
    description: 'Messaging, webhooks',
    docs: 'https://docs.microsoft.com/en-us/microsoftteams'
  },
  google: { 
    name: 'Google APIs', 
    icon: '🔷', 
    color: 'bg-blue-500',
    description: 'Calendar, Drive, Sheets',
    docs: 'https://developers.google.com'
  },
  google_places: { 
    name: 'Google Places', 
    icon: '📍', 
    color: 'bg-green-600',
    description: 'Place search and details',
    docs: 'https://developers.google.com/maps/documentation/places'
  },
  cloudflare: { 
    name: 'Cloudflare', 
    icon: '☁️', 
    color: 'bg-orange-500',
    description: 'DNS, CDN, cache management',
    docs: 'https://developers.cloudflare.com'
  },
  vercel: { 
    name: 'Vercel', 
    icon: '▲', 
    color: 'bg-black',
    description: 'Deployments, domains, projects',
    docs: 'https://vercel.com/docs'
  }
};

export default function IntegrationCard({ integration, onToggle, onConfigure, onTest }) {
  const info = INTEGRATION_INFO[integration.integration_key] || {
    name: integration.integration_name,
    icon: '🔌',
    color: 'bg-slate-500',
    description: 'External integration'
  };

  const getStatusBadge = () => {
    switch (integration.status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700"><Check className="h-3 w-3 mr-1" />Active</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-700"><AlertCircle className="h-3 w-3 mr-1" />Error</Badge>;
      case 'rate_limited':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Rate Limited</Badge>;
      default:
        return <Badge variant="outline">Disabled</Badge>;
    }
  };

  return (
    <Card className={`transition-all ${integration.is_enabled ? 'border-green-200 bg-green-50/30' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${info.color} flex items-center justify-center text-xl`}>
              {info.icon}
            </div>
            <div>
              <h3 className="font-semibold">{info.name}</h3>
              <p className="text-xs text-slate-500">{info.description}</p>
            </div>
          </div>
          <Switch 
            checked={integration.is_enabled} 
            onCheckedChange={(checked) => onToggle(integration, checked)}
          />
        </div>

        <div className="flex items-center justify-between mb-3">
          {getStatusBadge()}
          {integration.usage_count > 0 && (
            <span className="text-xs text-slate-500">
              {integration.usage_count} calls
            </span>
          )}
        </div>

        {integration.last_used && (
          <p className="text-xs text-slate-400 mb-3">
            Last used: {new Date(integration.last_used).toLocaleDateString()}
          </p>
        )}

        {integration.error_message && (
          <p className="text-xs text-red-600 mb-3 bg-red-50 p-2 rounded">
            {integration.error_message}
          </p>
        )}

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onConfigure(integration)}
          >
            <Settings className="h-3 w-3 mr-1" />
            Configure
          </Button>
          {info.docs && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.open(info.docs, '_blank')}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
          {onTest && integration.is_enabled && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onTest(integration)}
            >
              Test
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export { INTEGRATION_INFO };