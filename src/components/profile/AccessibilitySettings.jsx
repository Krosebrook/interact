import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accessibility, Eye, Type } from 'lucide-react';
import { toast } from 'sonner';

export default function AccessibilitySettings({ profile, onSave }) {
  const [settings, setSettings] = useState(profile?.accessibility_settings || {
    reduced_motion: false,
    high_contrast: false,
    font_size: 'medium',
    screen_reader_optimized: false
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ accessibility_settings: settings });
      
      // Apply settings immediately
      if (settings.reduced_motion) {
        document.documentElement.classList.add('reduce-motion');
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
      
      if (settings.high_contrast) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
      
      document.documentElement.setAttribute('data-font-size', settings.font_size);
      
      toast.success('Accessibility settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6" data-b44-sync="true" data-feature="profile" data-component="accessibilitysettings">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="h-5 w-5 text-int-orange" />
            Accessibility Preferences
          </CardTitle>
          <CardDescription>
            Customize the interface for your needs (WCAG 2.1 AA compliant)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <Label htmlFor="reduced-motion" className="cursor-pointer">
              <div className="font-medium">Reduced Motion</div>
              <div className="text-sm text-slate-500">Minimize animations and transitions</div>
            </Label>
            <Switch
              id="reduced-motion"
              checked={settings.reduced_motion}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, reduced_motion: checked }))}
            />
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-slate-500" />
              <Label htmlFor="high-contrast" className="cursor-pointer">
                <div className="font-medium">High Contrast Mode</div>
                <div className="text-sm text-slate-500">Increase contrast for better readability</div>
              </Label>
            </div>
            <Switch
              id="high-contrast"
              checked={settings.high_contrast}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, high_contrast: checked }))}
            />
          </div>

          {/* Font Size */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Type className="h-5 w-5 text-slate-500" />
              <Label htmlFor="font-size" className="text-sm font-medium">
                Font Size
              </Label>
            </div>
            <Select
              value={settings.font_size}
              onValueChange={(value) => setSettings(prev => ({ ...prev, font_size: value }))}
            >
              <SelectTrigger id="font-size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">
                  <span style={{ fontSize: '0.875rem' }}>Small</span>
                </SelectItem>
                <SelectItem value="medium">
                  <span style={{ fontSize: '1rem' }}>Medium (Default)</span>
                </SelectItem>
                <SelectItem value="large">
                  <span style={{ fontSize: '1.125rem' }}>Large</span>
                </SelectItem>
                <SelectItem value="x-large">
                  <span style={{ fontSize: '1.25rem' }}>Extra Large</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Screen Reader Optimization */}
          <div className="flex items-center justify-between">
            <Label htmlFor="screen-reader" className="cursor-pointer">
              <div className="font-medium">Screen Reader Optimization</div>
              <div className="text-sm text-slate-500">Enhanced labels and ARIA attributes</div>
            </Label>
            <Switch
              id="screen-reader"
              checked={settings.screen_reader_optimized}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, screen_reader_optimized: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Info */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Accessibility className="h-5 w-5 text-int-navy flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-600">
              <p className="font-medium text-slate-900 mb-1">Accessibility Commitment</p>
              <p className="leading-relaxed">
                This platform is designed to meet WCAG 2.1 Level AA standards. 
                If you encounter any accessibility barriers, please contact support for assistance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-int-orange hover:bg-int-orange/90"
        >
          {saving ? 'Applying...' : 'Apply Settings'}
        </Button>
      </div>
    </div>
  );
}