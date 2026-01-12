import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import toast from 'react-hot-toast';

/**
 * SSO Login Button Component
 * Initiates Single Sign-On authentication flow with enterprise identity providers
 * 
 * Supports:
 * - Azure Active Directory (Microsoft 365)
 * - Okta
 * - Google Workspace
 * - Generic SAML 2.0
 */
export default function SSOLoginButton({ provider = 'azure_ad', organizationId, className = '' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const providerConfig = {
    azure_ad: {
      name: 'Microsoft 365',
      icon: '🔷',
      description: 'Sign in with your work account'
    },
    okta: {
      name: 'Okta',
      icon: '🔐',
      description: 'Sign in through Okta'
    },
    google: {
      name: 'Google Workspace',
      icon: '🔍',
      description: 'Sign in with Google'
    },
    saml: {
      name: 'Enterprise SSO',
      icon: '🛡️',
      description: 'Sign in with your organization'
    }
  };

  const config = providerConfig[provider] || providerConfig.saml;

  const handleSSOLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get organization ID from domain or user input
      const orgId = organizationId || getOrganizationFromDomain();
      
      if (!orgId) {
        throw new Error('Please provide your organization identifier to sign in');
      }

      // Initiate SSO flow via Base44 function
      const result = await base44.functions.invoke('ssoAuth', {
        action: 'initiate',
        provider,
        organization_id: orgId
      });

      if (result.data.redirect_url) {
        // Redirect to IdP for authentication
        window.location.href = result.data.redirect_url;
      } else {
        throw new Error('Failed to initiate SSO login');
      }
    } catch (err) {
      console.error('SSO login error:', err);
      setError(err.message);
      toast.error(`SSO login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getOrganizationFromDomain = () => {
    // Extract organization from email domain or URL
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    // Check for subdomain pattern: org.interact.app
    if (parts.length >= 3 && parts[1] === 'interact') {
      return parts[0];
    }
    
    // Otherwise, prompt user for organization
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Enterprise Sign-In
        </CardTitle>
        <CardDescription>
          Use your organization's identity provider to sign in securely
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleSSOLogin}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redirecting...
            </>
          ) : (
            <>
              <span className="mr-2 text-xl">{config.icon}</span>
              Sign in with {config.name}
            </>
          )}
        </Button>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <p className="mt-4 text-xs text-center text-slate-500">
          {config.description}
        </p>
      </CardContent>
    </Card>
  );
}
