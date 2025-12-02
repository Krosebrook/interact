import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Treemap } from 'recharts';
import { Award, TrendingUp, TrendingDown, AlertTriangle, Star, Lock } from 'lucide-react';

const RARITY_COLORS = {
  common: '#94a3b8',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b'
};

const CATEGORY_COLORS = {
  engagement: '#D97230',
  collaboration: '#14294D',
  innovation: '#8B5CF6',
  community: '#EC4899',
  leadership: '#10B981',
  special: '#F59E0B'
};

export default function BadgeDistributionAnalysis({ badges = [], badgeAwards = [], userPoints = [] }) {
  const analysis = useMemo(() => {
    // Count awards per badge
    const awardCounts = {};
    badgeAwards.forEach(award => {
      awardCounts[award.badge_id] = (awardCounts[award.badge_id] || 0) + 1;
    });

    // Badge statistics
    const badgeStats = badges.map(badge => ({
      ...badge,
      awarded_count: awardCounts[badge.id] || 0,
      earning_rate: userPoints.length > 0 
        ? ((awardCounts[badge.id] || 0) / userPoints.length * 100).toFixed(1)
        : 0
    }));

    // Sort by different criteria
    const mostEarned = [...badgeStats].sort((a, b) => b.awarded_count - a.awarded_count);
    const leastEarned = [...badgeStats].filter(b => b.awarded_count === 0 || b.awarded_count < 3);
    
    // By rarity distribution
    const rarityDist = {};
    badges.forEach(b => {
      const rarity = b.rarity || 'common';
      if (!rarityDist[rarity]) {
        rarityDist[rarity] = { total: 0, earned: 0 };
      }
      rarityDist[rarity].total++;
      rarityDist[rarity].earned += awardCounts[b.id] || 0;
    });

    // By category distribution
    const categoryDist = {};
    badges.forEach(b => {
      const cat = b.category || 'engagement';
      if (!categoryDist[cat]) {
        categoryDist[cat] = { total: 0, earned: 0, badges: [] };
      }
      categoryDist[cat].total++;
      categoryDist[cat].earned += awardCounts[b.id] || 0;
      categoryDist[cat].badges.push({
        name: b.badge_name,
        value: awardCounts[b.id] || 0
      });
    });

    return {
      badgeStats,
      mostEarned: mostEarned.slice(0, 10),
      leastEarned,
      rarityDist: Object.entries(rarityDist).map(([rarity, data]) => ({
        rarity,
        ...data,
        avgPerBadge: data.total > 0 ? (data.earned / data.total).toFixed(1) : 0
      })),
      categoryDist: Object.entries(categoryDist).map(([category, data]) => ({
        category,
        ...data
      })),
      totalAwarded: Object.values(awardCounts).reduce((a, b) => a + b, 0),
      uniqueBadgesEarned: Object.keys(awardCounts).filter(k => awardCounts[k] > 0).length
    };
  }, [badges, badgeAwards, userPoints]);

  const rarityChartData = analysis.rarityDist.map(r => ({
    name: r.rarity.charAt(0).toUpperCase() + r.rarity.slice(1),
    earned: r.earned,
    available: r.total,
    fill: RARITY_COLORS[r.rarity]
  }));

  const categoryChartData = analysis.categoryDist.map(c => ({
    name: c.category.charAt(0).toUpperCase() + c.category.slice(1),
    value: c.earned,
    fill: CATEGORY_COLORS[c.category] || '#64748b'
  }));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-int-orange" />
          Badge Distribution Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-int-orange/10 to-amber-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-int-orange">{analysis.totalAwarded}</p>
            <p className="text-sm text-slate-600">Total Badges Awarded</p>
          </div>
          <div className="bg-gradient-to-br from-int-navy/10 to-blue-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-int-navy">{analysis.uniqueBadgesEarned}</p>
            <p className="text-sm text-slate-600">Unique Badges Earned</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-100 to-teal-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-emerald-600">
              {badges.length > 0 ? ((analysis.uniqueBadgesEarned / badges.length) * 100).toFixed(0) : 0}%
            </p>
            <p className="text-sm text-slate-600">Badge Unlock Rate</p>
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-pink-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">{analysis.leastEarned.length}</p>
            <p className="text-sm text-slate-600">Rarely Earned</p>
          </div>
        </div>

        <Tabs defaultValue="distribution" className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-4">
            <TabsTrigger value="distribution">By Rarity</TabsTrigger>
            <TabsTrigger value="category">By Category</TabsTrigger>
            <TabsTrigger value="top">Most Earned</TabsTrigger>
            <TabsTrigger value="rare">Rarely Earned</TabsTrigger>
          </TabsList>

          <TabsContent value="distribution">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rarityChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="earned" name="Times Awarded" radius={[0, 4, 4, 0]}>
                    {rarityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-5 gap-2 mt-4">
              {analysis.rarityDist.map(r => (
                <div key={r.rarity} className="text-center p-2 rounded-lg" style={{ backgroundColor: `${RARITY_COLORS[r.rarity]}20` }}>
                  <p className="text-xs font-medium capitalize" style={{ color: RARITY_COLORS[r.rarity] }}>{r.rarity}</p>
                  <p className="text-lg font-bold">{r.avgPerBadge}</p>
                  <p className="text-xs text-slate-500">avg/badge</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="category">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {analysis.categoryDist.map(cat => (
                  <div key={cat.category} className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: CATEGORY_COLORS[cat.category] || '#64748b' }}
                    />
                    <span className="text-sm capitalize flex-1">{cat.category}</span>
                    <span className="text-sm font-medium">{cat.earned}</span>
                    <span className="text-xs text-slate-400">({cat.total} badges)</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="top">
            <div className="space-y-3">
              {analysis.mostEarned.map((badge, idx) => (
                <div key={badge.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                  <span className="w-6 text-center font-bold text-slate-400">#{idx + 1}</span>
                  <span className="text-2xl">{badge.badge_icon}</span>
                  <div className="flex-1">
                    <p className="font-medium">{badge.badge_name}</p>
                    <p className="text-xs text-slate-500">{badge.badge_description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-int-orange">{badge.awarded_count}</p>
                    <p className="text-xs text-slate-500">{badge.earning_rate}% rate</p>
                  </div>
                  <Badge 
                    className="text-xs"
                    style={{ 
                      backgroundColor: `${RARITY_COLORS[badge.rarity]}20`,
                      color: RARITY_COLORS[badge.rarity]
                    }}
                  >
                    {badge.rarity}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rare">
            {analysis.leastEarned.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Star className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>All badges have been earned at least 3 times!</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg text-amber-800 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  These badges may need easier criteria or better promotion
                </div>
                {analysis.leastEarned.map(badge => (
                  <div key={badge.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                    <Lock className="h-4 w-4 text-slate-400" />
                    <span className="text-2xl opacity-50">{badge.badge_icon}</span>
                    <div className="flex-1">
                      <p className="font-medium">{badge.badge_name}</p>
                      <p className="text-xs text-slate-500">{badge.badge_description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-400">{badge.awarded_count}</p>
                      <p className="text-xs text-slate-500">times earned</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {badge.award_criteria?.type || 'manual'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}