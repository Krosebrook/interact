import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useUserData } from '../components/hooks/useUserData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ChannelList from '../components/channels/ChannelList';
import ChannelChat from '../components/channels/ChannelChat';
import CreateChannelDialog from '../components/channels/CreateChannelDialog';
import ChannelSettings from '../components/channels/ChannelSettings';
import { Button } from '@/components/ui/button';
import { Hash, MessageSquare, Menu, X } from 'lucide-react';

export default function Channels() {
  const { user, loading } = useUserData(true);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const { data: channels = [], isLoading } = useQuery({
    queryKey: ['channels'],
    queryFn: () => base44.entities.Channel.filter({ is_archived: false }, '-last_activity'),
    enabled: !!user
  });

  // Auto-select first channel
  React.useEffect(() => {
    if (channels.length > 0 && !selectedChannel) {
      const myChannels = channels.filter(c => 
        c.visibility === 'public' || 
        c.owner_email === user?.email || 
        c.member_emails?.includes(user?.email)
      );
      if (myChannels.length > 0) {
        setSelectedChannel(myChannels[0]);
      }
    }
  }, [channels, selectedChannel, user]);

  const handleSelectChannel = (channel) => {
    setSelectedChannel(channel);
    setMobileSidebarOpen(false);
  };

  const handleChannelDeleted = () => {
    setSelectedChannel(null);
  };

  if (loading || !user) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass-panel-solid">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-int-navy font-display">Team Channels</h1>
              <p className="text-slate-500 text-sm">Connect with your team in real-time</p>
            </div>
          </div>
          <Button
            className="lg:hidden"
            variant="outline"
            size="icon"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          >
            {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4" style={{ height: 'calc(100vh - 280px)' }}>
        {/* Channel List - Mobile Overlay or Desktop Sidebar */}
        <div className={`
          lg:col-span-1
          ${mobileSidebarOpen 
            ? 'fixed inset-0 z-50 bg-white lg:relative lg:inset-auto lg:z-auto' 
            : 'hidden lg:block'
          }
        `}>
          {mobileSidebarOpen && (
            <div className="lg:hidden absolute top-4 right-4 z-10">
              <Button variant="ghost" size="icon" onClick={() => setMobileSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}
          <div className="h-full">
            <ChannelList
              channels={channels}
              selectedChannel={selectedChannel}
              onSelectChannel={handleSelectChannel}
              onCreateChannel={() => setShowCreateDialog(true)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              userEmail={user.email}
            />
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 h-full">
          {isLoading ? (
            <LoadingSpinner className="h-full" />
          ) : (
            <ChannelChat
              channel={selectedChannel}
              user={user}
              onOpenSettings={() => setShowSettings(true)}
            />
          )}
        </div>
      </div>

      {/* Create Channel Dialog */}
      <CreateChannelDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        user={user}
      />

      {/* Channel Settings */}
      <ChannelSettings
        open={showSettings}
        onOpenChange={setShowSettings}
        channel={selectedChannel}
        user={user}
        onChannelDeleted={handleChannelDeleted}
      />
    </div>
  );
}