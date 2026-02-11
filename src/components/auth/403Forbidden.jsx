import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { getDefaultRoute } from './RouteConfig';
import { createPageUrl } from '../../utils';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';

export default function Forbidden({ attemptedRoute }) {
  const navigate = useNavigate();
  const { normalizedRole } = useAuth();

  const handleGoBack = () => {
    const defaultRoute = getDefaultRoute(normalizedRole);
    navigate(createPageUrl(defaultRoute));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="h-24 w-24 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="h-12 w-12 text-red-600" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-slate-900">Access Denied</h1>
          <p className="text-lg text-slate-600">
            You don't have permission to access this page.
          </p>
          {attemptedRoute && (
            <p className="text-sm text-slate-500 font-mono bg-slate-100 px-3 py-2 rounded-lg inline-block">
              {attemptedRoute}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleGoBack}
            className="bg-int-orange hover:bg-[#C46322] text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>

        {/* Role info */}
        <div className="pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Your role: <span className="font-semibold capitalize">{normalizedRole || 'Unknown'}</span>
          </p>
        </div>
      </div>
    </div>
  );
}