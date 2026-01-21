import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Lightbulb, Sparkles } from 'lucide-react';

export default function PersonalInterestsSection({ hobbies, funFacts, interests }) {
  const hasContent = hobbies?.length || funFacts?.length || interests?.length;

  if (!hasContent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600" />
            Get to Know Me
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">No personal information added yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-pink-50 to-purple-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-600" />
          Get to Know Me
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hobbies?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h4 className="font-semibold text-slate-900">Hobbies & Interests</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {hobbies.map((hobby, idx) => (
                <Badge key={idx} className="bg-purple-100 text-purple-800 border-purple-200">
                  {hobby}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {interests?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-yellow-600" />
              <h4 className="font-semibold text-slate-900">Professional Interests</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, idx) => (
                <Badge key={idx} className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {funFacts?.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Fun Facts</h4>
            <ul className="space-y-2">
              {funFacts.map((fact, idx) => (
                <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="text-pink-600 font-bold">•</span>
                  {fact}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}