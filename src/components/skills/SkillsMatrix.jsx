import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, TrendingUp, Award } from 'lucide-react';

const PROFICIENCY_COLORS = {
  beginner: '#94a3b8',
  intermediate: '#60a5fa',
  advanced: '#8b5cf6',
  expert: '#f59e0b'
};

export default function SkillsMatrix({ department }) {
  const { data: skills } = useQuery({
    queryKey: ['skills'],
    queryFn: async () => await base44.entities.Skill.list(),
    initialData: []
  });

  const { data: userSkills } = useQuery({
    queryKey: ['user-skills'],
    queryFn: async () => await base44.entities.UserSkill.list(),
    initialData: []
  });

  const { data: profiles } = useQuery({
    queryKey: ['user-profiles'],
    queryFn: async () => await base44.entities.UserProfile.list(),
    initialData: []
  });

  // Filter by department if specified
  const deptProfiles = department 
    ? profiles.filter(p => p.department === department)
    : profiles;
  const deptEmails = deptProfiles.map(p => p.user_email);

  // Calculate skill distribution
  const skillStats = skills.map(skill => {
    const usersWithSkill = userSkills.filter(us => 
      us.skill_id === skill.id && 
      (!department || deptEmails.includes(us.user_email))
    );

    const proficiencyCount = {
      beginner: usersWithSkill.filter(us => us.proficiency === 'beginner').length,
      intermediate: usersWithSkill.filter(us => us.proficiency === 'intermediate').length,
      advanced: usersWithSkill.filter(us => us.proficiency === 'advanced').length,
      expert: usersWithSkill.filter(us => us.proficiency === 'expert').length
    };

    return {
      name: skill.skill_name,
      category: skill.category,
      total: usersWithSkill.length,
      ...proficiencyCount,
      demand_level: skill.demand_level
    };
  }).sort((a, b) => b.total - a.total);

  const topSkills = skillStats.slice(0, 10);

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Total Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{skills.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              Avg Skills/Person
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">
              {deptProfiles.length > 0 
                ? (userSkills.filter(us => deptEmails.includes(us.user_email)).length / deptProfiles.length).toFixed(1)
                : 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              High Demand Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {skills.filter(s => s.demand_level === 'high' || s.demand_level === 'critical').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 10 Skills Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topSkills} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="beginner" stackId="a" fill={PROFICIENCY_COLORS.beginner} name="Beginner" />
              <Bar dataKey="intermediate" stackId="a" fill={PROFICIENCY_COLORS.intermediate} name="Intermediate" />
              <Bar dataKey="advanced" stackId="a" fill={PROFICIENCY_COLORS.advanced} name="Advanced" />
              <Bar dataKey="expert" stackId="a" fill={PROFICIENCY_COLORS.expert} name="Expert" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Skills Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {skillStats.map(skill => (
              <div key={skill.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900">{skill.name}</h4>
                    <Badge variant="outline" className="text-xs">{skill.category}</Badge>
                    {skill.demand_level === 'high' && (
                      <Badge className="bg-orange-100 text-orange-800 text-xs">High Demand</Badge>
                    )}
                    {skill.demand_level === 'critical' && (
                      <Badge className="bg-red-100 text-red-800 text-xs">Critical</Badge>
                    )}
                  </div>
                  <div className="flex gap-2 text-xs">
                    {skill.expert > 0 && <span className="text-amber-600">★ {skill.expert} experts</span>}
                    {skill.advanced > 0 && <span className="text-purple-600">■ {skill.advanced} advanced</span>}
                    {skill.intermediate > 0 && <span className="text-blue-600">● {skill.intermediate} intermediate</span>}
                    {skill.beginner > 0 && <span className="text-slate-600">○ {skill.beginner} beginners</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">{skill.total}</p>
                  <p className="text-xs text-slate-600">employees</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}