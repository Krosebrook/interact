import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Settings, Palette, Award, Target, Users, Sliders, 
  Save, RefreshCw, Plus, Trash2, Eye
} from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_CONFIG = {
  config_key: 'default',
  modules_enabled: {
    badges: true,
    challenges: true,
    leaderboards: true,
    points: true,
    rewards: true,
    tiers: true,
    streaks: true,
    social_sharing: true
  },
  theme: {
    primary_color: '#D97230',
    secondary_color: '#14294D',
    accent_color: '#10B981',
    badge_style: 'modern',
    leaderboard_style: 'standard',
    animations_enabled: true
  },
  points_config: {
    event_attendance: 10,
    feedback_submitted: 5,
    recognition_given: 3,
    recognition_received: 5,
    challenge_completed: 25,
    streak_bonus_per_day: 2
  },
  difficulty_scaling: {
    enabled: true,
    base_difficulty: 'medium',
    auto_adjust: true,
    scaling_factor: 1.2
  },
  user_segments: [],
  custom_badge_rules: [],
  leaderboard_formats: []
};

export default function GamificationConfigPanel() {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState('modules');

  const { data: savedConfig, isLoading } = useQuery({
    queryKey: ['gamification-config'],
    queryFn: async () => {
      const configs = await base44.entities.GamificationConfig.filter({ config_key: 'default' });
      return configs[0] || null;
    }
  });

  useEffect(() => {
    if (savedConfig) {
      setConfig({ ...DEFAULT_CONFIG, ...savedConfig });
    }
  }, [savedConfig]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (savedConfig?.id) {
        return base44.entities.GamificationConfig.update(savedConfig.id, config);
      } else {
        return base44.entities.GamificationConfig.create(config);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['gamification-config']);
      toast.success('Configuration saved successfully');
    }
  });

  const updateModules = (module, enabled) => {
    setConfig(prev => ({
      ...prev,
      modules_enabled: { ...prev.modules_enabled, [module]: enabled }
    }));
  };

  const updateTheme = (key, value) => {
    setConfig(prev => ({
      ...prev,
      theme: { ...prev.theme, [key]: value }
    }));
  };

  const updatePoints = (key, value) => {
    setConfig(prev => ({
      ...prev,
      points_config: { ...prev.points_config, [key]: parseInt(value) || 0 }
    }));
  };

  const updateDifficulty = (key, value) => {
    setConfig(prev => ({
      ...prev,
      difficulty_scaling: { ...prev.difficulty_scaling, [key]: value }
    }));
  };

  const addUserSegment = () => {
    const newSegment = {
      segment_id: `segment_${Date.now()}`,
      segment_name: 'New Segment',
      criteria: {},
      modules_override: {},
      points_multiplier: 1
    };
    setConfig(prev => ({
      ...prev,
      user_segments: [...(prev.user_segments || []), newSegment]
    }));
  };

  const addCustomBadgeRule = () => {
    const newRule = {
      rule_id: `rule_${Date.now()}`,
      rule_name: 'New Badge Rule',
      badge_id: '',
      trigger_type: 'metric_threshold',
      conditions: [],
      is_active: true
    };
    setConfig(prev => ({
      ...prev,
      custom_badge_rules: [...(prev.custom_badge_rules || []), newRule]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" data-b44-sync="true" data-feature="admin" data-component="gamificationconfigpanel">
        <RefreshCw className="h-6 w-6 animate-spin text-int-orange" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-int-orange" />
          Gamification Configuration
        </CardTitle>
        <Button 
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="bg-int-orange hover:bg-int-orange/90"
        >
          <Save className="h-4 w-4 mr-2" />
          {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full mb-6">
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="points">Points</TabsTrigger>
            <TabsTrigger value="segments">Segments</TabsTrigger>
            <TabsTrigger value="rules">Custom Rules</TabsTrigger>
          </TabsList>

          {/* Modules Tab */}
          <TabsContent value="modules">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(config.modules_enabled || {}).map(([module, enabled]) => (
                <div 
                  key={module}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                >
                  <div>
                    <Label className="font-medium capitalize">{module.replace(/_/g, ' ')}</Label>
                    <p className="text-xs text-slate-500">
                      {enabled ? 'Active for all users' : 'Disabled'}
                    </p>
                  </div>
                  <Switch 
                    checked={enabled}
                    onCheckedChange={(checked) => updateModules(module, checked)}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Theme Tab */}
          <TabsContent value="theme">
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Primary Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input 
                      type="color"
                      value={config.theme?.primary_color || '#D97230'}
                      onChange={(e) => updateTheme('primary_color', e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input 
                      value={config.theme?.primary_color || '#D97230'}
                      onChange={(e) => updateTheme('primary_color', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input 
                      type="color"
                      value={config.theme?.secondary_color || '#14294D'}
                      onChange={(e) => updateTheme('secondary_color', e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input 
                      value={config.theme?.secondary_color || '#14294D'}
                      onChange={(e) => updateTheme('secondary_color', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Accent Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input 
                      type="color"
                      value={config.theme?.accent_color || '#10B981'}
                      onChange={(e) => updateTheme('accent_color', e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input 
                      value={config.theme?.accent_color || '#10B981'}
                      onChange={(e) => updateTheme('accent_color', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Badge Style</Label>
                  <Select 
                    value={config.theme?.badge_style || 'modern'}
                    onValueChange={(v) => updateTheme('badge_style', v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="playful">Playful</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Leaderboard Style</Label>
                  <Select 
                    value={config.theme?.leaderboard_style || 'standard'}
                    onValueChange={(v) => updateTheme('leaderboard_style', v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="podium">Podium</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="cards">Cards</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <Label>Enable Animations</Label>
                  <p className="text-xs text-slate-500">Show animations for achievements and level-ups</p>
                </div>
                <Switch 
                  checked={config.theme?.animations_enabled ?? true}
                  onCheckedChange={(checked) => updateTheme('animations_enabled', checked)}
                />
              </div>

              {/* Preview */}
              <div className="p-4 border rounded-lg">
                <Label className="mb-3 block">Preview</Label>
                <div className="flex gap-4">
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl"
                    style={{ backgroundColor: config.theme?.primary_color }}
                  >
                    🏆
                  </div>
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl"
                    style={{ backgroundColor: config.theme?.secondary_color }}
                  >
                    👑
                  </div>
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl"
                    style={{ backgroundColor: config.theme?.accent_color }}
                  >
                    ⭐
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Points Tab */}
          <TabsContent value="points">
            <div className="space-y-4">
              {Object.entries(config.points_config || {}).map(([key, value]) => (
                <div key={key} className="flex items-center gap-4">
                  <Label className="w-48 capitalize">{key.replace(/_/g, ' ')}</Label>
                  <Input 
                    type="number"
                    value={value}
                    onChange={(e) => updatePoints(key, e.target.value)}
                    className="w-24"
                    min={0}
                  />
                  <span className="text-sm text-slate-500">points</span>
                </div>
              ))}

              <div className="border-t pt-4 mt-6">
                <h4 className="font-medium mb-4">Difficulty Scaling</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Enable Auto-Scaling</Label>
                    <Switch 
                      checked={config.difficulty_scaling?.enabled ?? true}
                      onCheckedChange={(checked) => updateDifficulty('enabled', checked)}
                    />
                  </div>
                  <div>
                    <Label>Base Difficulty</Label>
                    <Select 
                      value={config.difficulty_scaling?.base_difficulty || 'medium'}
                      onValueChange={(v) => updateDifficulty('base_difficulty', v)}
                    >
                      <SelectTrigger className="mt-1 w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Scaling Factor: {config.difficulty_scaling?.scaling_factor || 1.2}x</Label>
                    <Slider 
                      value={[(config.difficulty_scaling?.scaling_factor || 1.2) * 100]}
                      onValueChange={([v]) => updateDifficulty('scaling_factor', v / 100)}
                      min={100}
                      max={200}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Segments Tab */}
          <TabsContent value="segments">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-500">
                  Define user segments with custom gamification settings
                </p>
                <Button variant="outline" size="sm" onClick={addUserSegment}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Segment
                </Button>
              </div>

              {(config.user_segments || []).map((segment, idx) => (
                <Card key={segment.segment_id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <Input 
                        value={segment.segment_name}
                        onChange={(e) => {
                          const newSegments = [...config.user_segments];
                          newSegments[idx].segment_name = e.target.value;
                          setConfig(prev => ({ ...prev, user_segments: newSegments }));
                        }}
                        placeholder="Segment name"
                      />
                      <div className="flex items-center gap-4">
                        <Label className="text-sm">Points Multiplier:</Label>
                        <Input 
                          type="number"
                          value={segment.points_multiplier}
                          onChange={(e) => {
                            const newSegments = [...config.user_segments];
                            newSegments[idx].points_multiplier = parseFloat(e.target.value) || 1;
                            setConfig(prev => ({ ...prev, user_segments: newSegments }));
                          }}
                          className="w-20"
                          min={0.1}
                          max={5}
                          step={0.1}
                        />
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500"
                      onClick={() => {
                        const newSegments = config.user_segments.filter((_, i) => i !== idx);
                        setConfig(prev => ({ ...prev, user_segments: newSegments }));
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}

              {(config.user_segments || []).length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Users className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                  <p>No segments defined. Add segments to customize gamification for different user groups.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Custom Rules Tab */}
          <TabsContent value="rules">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-500">
                  Create custom badge award rules beyond standard criteria
                </p>
                <Button variant="outline" size="sm" onClick={addCustomBadgeRule}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>

              {(config.custom_badge_rules || []).map((rule, idx) => (
                <Card key={rule.rule_id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Input 
                          value={rule.rule_name}
                          onChange={(e) => {
                            const newRules = [...config.custom_badge_rules];
                            newRules[idx].rule_name = e.target.value;
                            setConfig(prev => ({ ...prev, custom_badge_rules: newRules }));
                          }}
                          placeholder="Rule name"
                          className="flex-1"
                        />
                        <Switch 
                          checked={rule.is_active}
                          onCheckedChange={(checked) => {
                            const newRules = [...config.custom_badge_rules];
                            newRules[idx].is_active = checked;
                            setConfig(prev => ({ ...prev, custom_badge_rules: newRules }));
                          }}
                        />
                      </div>
                      <Select 
                        value={rule.trigger_type}
                        onValueChange={(v) => {
                          const newRules = [...config.custom_badge_rules];
                          newRules[idx].trigger_type = v;
                          setConfig(prev => ({ ...prev, custom_badge_rules: newRules }));
                        }}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Trigger type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="metric_threshold">Metric Threshold</SelectItem>
                          <SelectItem value="event_based">Event Based</SelectItem>
                          <SelectItem value="time_based">Time Based</SelectItem>
                          <SelectItem value="combination">Combination</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500"
                      onClick={() => {
                        const newRules = config.custom_badge_rules.filter((_, i) => i !== idx);
                        setConfig(prev => ({ ...prev, custom_badge_rules: newRules }));
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}

              {(config.custom_badge_rules || []).length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Award className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                  <p>No custom rules defined. Add rules to create advanced badge award criteria.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}