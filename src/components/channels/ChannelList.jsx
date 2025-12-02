import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Hash, 
  Lock, 
  Users, 
  Megaphone, 
  Lightbulb, 
  FolderKanban,
  Plus,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatTimeAgo } from '../utils/formatters';

const TYPE_ICONS = {
  team: Users,
  project: FolderKanban,
  interest: Lightbulb,
  announcement: Megaphone
};

const TYPE_COLORS = {
  team: 'bg-blue-500',
  project: 'bg-purple-500',
  interest: 'bg-pink-500',
  announcement: 'bg-amber-500'
};

export default function ChannelList({ 
  channels, 
  selectedChannel, 
  onSelectChannel, 
  onCreateChannel,
  searchQuery,
  onSearchChange,
  userEmail
}) {
  const myChannels = channels.filter(c => 
    c.visibility === 'public' || 
    c.owner_email === userEmail || 
    c.member_emails?.includes(userEmail)
  );

  const publicChannels = myChannels.filter(c => c.visibility === 'public');
  const privateChannels = myChannels.filter(c => c.visibility !== 'public');

  const filteredPublic = publicChannels.filter(c => 
    !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredPrivate = privateChannels.filter(c => 
    !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ChannelItem = ({ channel }) => {
    const Icon = TYPE_ICONS[channel.type] || Hash;
    const isSelected = selectedChannel?.id === channel.id;
    const isPrivate = channel.visibility !== 'public';

    return (
      <motion.button
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelectChannel(channel)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
          isSelected 
            ? 'bg-int-orange text-white' 
            : 'hover:bg-slate-100 text-slate-700'
        }`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          isSelected ? 'bg-white/20' : TYPE_COLORS[channel.type] + '/10'
        }`}>
          {channel.icon ? (
            <span className="text-lg">{channel.icon}</span>
          ) : (
            <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : TYPE_COLORS[channel.type]?.replace('bg-', 'text-')}`} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {isPrivate && <Lock className="h-3 w-3 opacity-60" />}
            <span className="font-medium truncate">{channel.name}</span>
          </div>
          {channel.last_activity && (
            <p className={`text-xs truncate ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
              {formatTimeAgo(channel.last_activity)}
            </p>
          )}
        </div>
        {channel.member_count > 0 && (
          <Badge variant={isSelected ? 'secondary' : 'outline'} className="text-xs">
            {channel.member_count}
          </Badge>
        )}
      </motion.button>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-900">Channels</h2>
          <Button size="sm" onClick={onCreateChannel} className="bg-int-orange hover:bg-int-orange/90">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search channels..."
            className="pl-9 bg-slate-50 border-0"
          />
        </div>
      </div>

      {/* Channel List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Public Channels */}
          {filteredPublic.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Public Channels
              </p>
              <div className="space-y-1">
                {filteredPublic.map(channel => (
                  <ChannelItem key={channel.id} channel={channel} />
                ))}
              </div>
            </div>
          )}

          {/* Private Channels */}
          {filteredPrivate.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Private Channels
              </p>
              <div className="space-y-1">
                {filteredPrivate.map(channel => (
                  <ChannelItem key={channel.id} channel={channel} />
                ))}
              </div>
            </div>
          )}

          {filteredPublic.length === 0 && filteredPrivate.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No channels found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}