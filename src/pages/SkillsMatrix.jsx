import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Award } from 'lucide-react';
import SkillsMatrix from '../components/skills/SkillsMatrix';
import SkillGapAnalysis from '../components/skills/SkillGapAnalysis';
import LearningPathSuggestions from '../components/skills/LearningPathSuggestions';

export default function SkillsMatrixPage() {
  const [department, setDepartment] = useState('all');

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => await base44.entities.UserProfile.list(),
    initialData: []
  });

  const departments = [...new Set(profiles.map(p => p.department).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Award className="w-8 h-8 text-purple-600" />
            Skills Matrix
          </h1>
          <p className="text-slate-600 mt-1">Visualize team capabilities and identify growth opportunities</p>
        </div>
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="matrix">
        <TabsList>
          <TabsTrigger value="matrix">Skills Overview</TabsTrigger>
          <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
          <TabsTrigger value="learning">Learning Paths</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix" className="space-y-4">
          <SkillsMatrix department={department === 'all' ? null : department} />
        </TabsContent>

        <TabsContent value="gaps">
          <SkillGapAnalysis />
        </TabsContent>

        <TabsContent value="learning">
          <LearningPathSuggestions />
        </TabsContent>
      </Tabs>
    </div>
  );
}