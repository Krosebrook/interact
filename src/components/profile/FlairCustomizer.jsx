import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Award, Crown, Lock } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

export default function FlairCustomizer({ userEmail, currentFlair = {}, userPoints, onSave, isSaving }) {
  const [selectedBorder, setSelectedBorder] = useState(currentFlair.avatar_border || 'default');
  const [selectedTitle, setSelectedTitle] = useState(currentFlair.profile_title || null);
  const [featuredBadges, setFeaturedBadges] = useState(currentFlair.featured_badges || []);

  const { data: flairOptions, isLoading } = useQuery({
    queryKey: ['flair-options', userEmail],
    queryFn: async () => {
      const response = await base44.functions.invoke('gamificationPersonalizationAI', {
        action: 'recommend_flair',
        context: {}
      });
      return response.data.flair_options;
    },
    enabled: !!userEmail
  });

  const handleSave = () => {
    onSave({
      avatar_border: selectedBorder,
      profile_title: selectedTitle,
      featured_badges: featuredBadges
    });
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading flair options..." />;
  }

  const borders = flairOptions?.filter(f => f.type === 'border') || [];
  const titles = flairOptions?.filter(f => f.type === 'title') || [];
  const badgeOptions = flairOptions?.filter(f => f.type === 'badge_showcase') || [];

  return (
    <div className="space-y-6" data-b44-sync="true" data-feature="profile" data-component="flaircustomizer">
      {/* Preview */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="py-6">
          <div className="flex items-center justify-center gap-4">
            <div className={`relative ${getBorderClass(selectedBorder)}`}>
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-int-orange to-int-gold flex items-center justify-center text-white text-3xl font-bold">
                {userEmail?.charAt(0).toUpperCase()}
              </div>
              {selectedTitle && (
                <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs whitespace-nowrap">
                  {selectedTitle}
                </Badge>
              )}
            </div>
          </div>
          <p className="text-center text-sm text-slate-600 mt-4">Live Preview</p>
        </CardContent>
      </Card>

      {/* Customization Options */}
      <Tabs defaultValue="borders">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="borders">Borders</TabsTrigger>
          <TabsTrigger value="titles">Titles</TabsTrigger>
          <TabsTrigger value="badges">Showcase</TabsTrigger>
        </TabsList>

        {/* Borders */}
        <TabsContent value="borders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Avatar Borders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {borders.map((border) => (
                  <FlairOption
                    key={border.id}
                    flair={border}
                    isSelected={selectedBorder === border.id}
                    onSelect={() => border.is_unlocked && setSelectedBorder(border.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Titles */}
        <TabsContent value="titles" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Titles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {titles.map((title) => (
                  <FlairOption
                    key={title.id}
                    flair={title}
                    isSelected={selectedTitle === title.name}
                    onSelect={() => title.is_unlocked && setSelectedTitle(title.name)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badge Showcase */}
        <TabsContent value="badges" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Featured Badges (Select up to 3)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {badgeOptions.slice(0, 6).map((badge) => (
                  <FlairOption
                    key={badge.id}
                    flair={badge}
                    isSelected={featuredBadges.includes(badge.id)}
                    onSelect={() => {
                      if (!badge.is_unlocked) return;
                      setFeaturedBadges(prev => 
                        prev.includes(badge.id)
                          ? prev.filter(id => id !== badge.id)
                          : prev.length < 3 ? [...prev, badge.id] : prev
                      );
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <Card>
        <CardContent className="py-4">
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? 'Saving...' : 'Apply Customization'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function FlairOption({ flair, isSelected, onSelect }) {
  const rarityColors = {
    common: 'border-slate-300',
    rare: 'border-blue-400',
    epic: 'border-purple-400',
    legendary: 'border-amber-400'
  };

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        !flair.is_unlocked ? 'opacity-50 cursor-not-allowed' :
        isSelected ? 'border-int-orange bg-orange-50' :
        rarityColors[flair.rarity] || 'border-slate-200'
      } hover:shadow-md`}
    >
      <div className="flex items-start justify-between mb-2">
        <h5 className="font-semibold text-sm">{flair.name}</h5>
        {!flair.is_unlocked && <Lock className="h-4 w-4 text-slate-400" />}
      </div>
      <p className="text-xs text-slate-600 mb-2">{flair.description}</p>
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs capitalize">
          {flair.rarity}
        </Badge>
        {flair.is_unlocked ? (
          <Badge className="bg-emerald-100 text-emerald-800 text-xs">Unlocked</Badge>
        ) : (
          <p className="text-xs text-slate-500">{flair.unlock_requirement}</p>
        )}
      </div>
    </div>
  );
}

function getBorderClass(borderId) {
  const borders = {
    default: 'p-1 bg-slate-200 rounded-full',
    bronze: 'p-1 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full',
    silver: 'p-1 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full',
    gold: 'p-1 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-full',
    platinum: 'p-1 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-full',
    rainbow: 'p-1 bg-gradient-to-br from-red-500 via-purple-500 to-blue-500 rounded-full animate-pulse'
  };
  return borders[borderId] || borders.default;
}