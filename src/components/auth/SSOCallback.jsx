import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';

/**
 * SSO Callback Handler Component
 * Handles the callback from identity provider after authentication
 * Completes the SSO flow by exchanging tokens and creating user session
 */
export default function SSOCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Completing sign-in...');

  useEffect(() => {
    handleSSOCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSSOCallback = async () => {
    try {
      // Get callback parameters
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const samlResponse = searchParams.get('SAMLResponse');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Check for errors from IdP
      if (error) {
        throw new Error(errorDescription || error);
      }

      // Validate required parameters
      if (!code && !samlResponse) {
        throw new Error('Missing authentication parameters');
      }

      setMessage('Verifying authentication...');

      // Complete SSO flow via Base44 function
      const result = await base44.functions.invoke('ssoAuth', {
        action: 'callback',
        code,
        state,
        saml_response: samlResponse
      });

      if (result.data.success) {
        setStatus('success');
        setMessage('Sign-in successful! Redirecting...');
        
        // Note: Session token is managed securely by Base44 SDK
        // Token is stored in httpOnly cookie by the backend
        // For additional client-side operations, use the SDK's session management
        
        // Wait briefly to show success message
        setTimeout(() => {
          // Redirect to dashboard or intended destination
          const redirectTo = sessionStorage.getItem('sso_redirect') || '/dashboard';
          sessionStorage.removeItem('sso_redirect');
          navigate(redirectTo);
        }, 1500);
      } else {
        throw new Error(result.data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error('SSO callback error:', err);
      setStatus('error');
      setMessage(err.message || 'Authentication failed');
      toast.error(`Sign-in failed: ${err.message}`);
      
      // Redirect to login after delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  const StatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-12 w-12 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-600" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Enterprise Sign-In</CardTitle>
          <CardDescription className="text-center">
            {status === 'processing' && 'Processing your authentication...'}
            {status === 'success' && 'Successfully authenticated'}
            {status === 'error' && 'Authentication failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <StatusIcon />
          <p className="text-center text-sm text-slate-600">
            {message}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
