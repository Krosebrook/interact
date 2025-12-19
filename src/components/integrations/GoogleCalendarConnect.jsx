import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CheckCircle2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function GoogleCalendarConnect({ onConnectionChange }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  React.useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const response = await base44.functions.invoke('syncToGoogleCalendar', {
        event_id: 'test',
        action: 'check',
      });
      
      const connected = !response.data?.requiresAuth;
      setIsConnected(connected);
      onConnectionChange?.(connected);
    } catch (error) {
      setIsConnected(false);
      onConnectionChange?.(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleConnect = () => {
    setIsConnecting(true);
    const connectUrl = base44.connectors.getOAuthURL('googlecalendar');
    window.location.href = connectUrl;
  };

  const handleDisconnect = async () => {
    toast.info('To disconnect, revoke access in your Google Account settings');
  };

  if (isChecking) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <CardTitle>Google Calendar</CardTitle>
            <CardDescription>
              Sync events and send automatic calendar invites
            </CardDescription>
          </div>
          {isConnected && (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              <CheckCircle2 className="h-4 w-4" />
              <span>Connected to Google Calendar</span>
            </div>
            <div className="text-sm text-slate-600">
              <p className="mb-2">You can now:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Add events to your Google Calendar</li>
                <li>Import events from Google Calendar</li>
                <li>Send automatic calendar invites</li>
                <li>Keep events synced</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={checkConnection}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Status
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                className="gap-2"
              >
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span>Not connected</span>
            </div>
            <p className="text-sm text-slate-600">
              Connect your Google Calendar to automatically sync events and send calendar invites to participants.
            </p>
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  Connect Google Calendar
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}